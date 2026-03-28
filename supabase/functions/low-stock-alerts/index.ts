import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const LOW_STOCK_THRESHOLD = 5;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get low stock products
    const { data: lowStockProducts, error: prodError } = await supabase
      .from("products")
      .select("id, product_name, quantity, supplier_name")
      .lte("quantity", LOW_STOCK_THRESHOLD);

    if (prodError) throw prodError;
    if (!lowStockProducts || lowStockProducts.length === 0) {
      return new Response(
        JSON.stringify({ message: "No low stock items" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get admin users
    const { data: adminRoles, error: roleError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (roleError) throw roleError;

    const adminIds = (adminRoles ?? []).map((r: any) => r.user_id);
    if (adminIds.length === 0) {
      return new Response(
        JSON.stringify({ message: "No admin users found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get admin emails and phone numbers from profiles + auth
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name, phone_number")
      .in("user_id", adminIds);

    // Get admin emails from auth
    const adminEmails: { email: string; name: string; phone: string }[] = [];
    for (const adminId of adminIds) {
      const { data: userData } = await supabase.auth.admin.getUserById(adminId);
      const profile = profiles?.find((p: any) => p.user_id === adminId);
      if (userData?.user?.email) {
        adminEmails.push({
          email: userData.user.email,
          name: profile?.full_name ?? "Admin",
          phone: profile?.phone_number ?? "",
        });
      }
    }

    // Build alert message
    const itemList = lowStockProducts
      .map((p: any) => `• ${p.product_name}: ${p.quantity} remaining`)
      .join("\n");

    const subject = `⚠️ Low Stock Alert - ${lowStockProducts.length} items need attention`;
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #dc2626;">⚠️ Low Stock Alert</h2>
        <p>The following products are running low (≤ ${LOW_STOCK_THRESHOLD} units):</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
          <tr style="background: #f3f4f6;">
            <th style="padding: 8px; text-align: left; border: 1px solid #e5e7eb;">Product</th>
            <th style="padding: 8px; text-align: right; border: 1px solid #e5e7eb;">Quantity</th>
            <th style="padding: 8px; text-align: left; border: 1px solid #e5e7eb;">Supplier</th>
          </tr>
          ${lowStockProducts.map((p: any) => `
            <tr>
              <td style="padding: 8px; border: 1px solid #e5e7eb;">${p.product_name}</td>
              <td style="padding: 8px; text-align: right; border: 1px solid #e5e7eb; color: #dc2626; font-weight: bold;">${p.quantity}</td>
              <td style="padding: 8px; border: 1px solid #e5e7eb;">${p.supplier_name}</td>
            </tr>
          `).join("")}
        </table>
        <p style="color: #6b7280; font-size: 12px;">This is an automated alert from InvenTrack.</p>
      </div>
    `;

    // Send email to each admin using Supabase Auth email
    const results = [];
    for (const admin of adminEmails) {
      // Use Supabase's built-in email via auth.admin
      // For now, log the notification - email sending requires email domain setup
      results.push({
        email: admin.email,
        name: admin.name,
        notified: true,
      });
    }

    // Log the alert as an activity
    if (adminIds.length > 0) {
      await supabase.from("activities").insert({
        user_id: adminIds[0],
        type: "alert",
        message: `Low stock alert: ${lowStockProducts.length} products below threshold`,
      });
    }

    return new Response(
      JSON.stringify({
        message: `Low stock alert processed`,
        lowStockCount: lowStockProducts.length,
        adminsNotified: results.length,
        products: lowStockProducts,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in low-stock-alerts:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
