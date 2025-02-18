import { BlogDetailResponse } from "@/types/blog";
import axios from "axios";
import { showError } from "@/lib/alerts";
import { BlogForm } from "../../../components/blog-form";

interface EditBlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function EditBlogPostPage({
  params,
}: EditBlogPostPageProps) {
  const slug = (await params).slug;

  const fetchPost = async () => {
    try {
      const response = await axios.get<BlogDetailResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/api/blogs-single/${slug}/`
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching post:", error);
      showError("Failed to fetch post");
    }
  };

  const post = await fetchPost();

  if (!post) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">Post not found.</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Blog Post</h1>
      </div>

      <BlogForm initialData={post?.data} />
    </div>
  );
}
