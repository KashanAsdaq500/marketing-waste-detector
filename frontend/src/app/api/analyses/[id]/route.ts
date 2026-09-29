import { auth } from "@clerk/nextjs/server";
import { sql } from "@/lib/db";

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const result = await sql.query(
      `DELETE FROM analyses
       WHERE id = $1 AND user_id = $2
       RETURNING id`,
      [params.id, userId]
    );

    if (result.length === 0) {
      return Response.json(
        { error: "Analysis not found" },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      id: params.id,
    });
  } catch (error) {
    console.error("Failed to delete analysis:", error);

    return Response.json(
      { error: "Failed to delete analysis" },
      { status: 500 }
    );
  }
}