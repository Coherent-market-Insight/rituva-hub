import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import {
  successResponse,
  createdResponse,
  errorResponse,
  unauthorizedResponse,
} from "@/lib/api-response";

// GET /api/tasks/[id]/attachments - Get all attachments for a task
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const taskId = params.id;

    // Verify task exists
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return errorResponse("Task not found", 404);
    }

    // Get all attachments for this task
    const attachments = await prisma.taskAttachment.findMany({
      where: { task_id: taskId },
      orderBy: { created_at: "desc" },
    });

    return successResponse(attachments);
  } catch (error) {
    console.error("Error fetching attachments:", error);
    return errorResponse("Failed to fetch attachments", 500);
  }
}

// POST /api/tasks/[id]/attachments - Save attachment metadata after upload
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const taskId = params.id;
    const body = await request.json();

    const { fileName, fileUrl, fileSize, fileType } = body;

    if (!fileName || !fileUrl || !fileSize) {
      return errorResponse(
        "Missing required fields: fileName, fileUrl, fileSize",
        400
      );
    }

    // Verify task exists
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return errorResponse("Task not found", 404);
    }

    // Create attachment record
    const attachment = await prisma.taskAttachment.create({
      data: {
        task_id: taskId,
        file_name: fileName,
        file_url: fileUrl,
        file_size: fileSize,
        file_type: fileType || null,
        uploaded_by: user.userId,
      },
    });

    return createdResponse(attachment, "Attachment saved successfully");
  } catch (error) {
    console.error("Error saving attachment:", error);
    return errorResponse("Failed to save attachment", 500);
  }
}

// DELETE /api/tasks/[id]/attachments - Delete an attachment
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return unauthorizedResponse();
    }

    const { searchParams } = new URL(request.url);
    const attachmentId = searchParams.get("attachmentId");

    if (!attachmentId) {
      return errorResponse("Missing attachmentId parameter", 400);
    }

    // Get attachment to verify ownership
    const attachment = await prisma.taskAttachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment) {
      return errorResponse("Attachment not found", 404);
    }

    // Only allow deleting your own attachments or if you're admin
    if (attachment.uploaded_by !== user.userId && user.role !== "admin") {
      return errorResponse("Unauthorized to delete this attachment", 403);
    }

    // Delete attachment record
    await prisma.taskAttachment.delete({
      where: { id: attachmentId },
    });

    return successResponse({ message: "Attachment deleted successfully" });
  } catch (error) {
    console.error("Error deleting attachment:", error);
    return errorResponse("Failed to delete attachment", 500);
  }
}
