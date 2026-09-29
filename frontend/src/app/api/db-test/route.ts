import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const result = await sql.query(
      "SELECT current_database() AS database, current_user AS user"
    );

    return Response.json({
      success: true,
      clerk_user_id: userId,
      database: result[0]?.database,
      database_user: result[0]?.user,
    });
  } catch (error) {
    console.error("Neon DB test failed:", error);

    return Response.json(
      {
        success: false,
        error: "Database connection failed",
      },
      { status: 500 }
    );
  }
}