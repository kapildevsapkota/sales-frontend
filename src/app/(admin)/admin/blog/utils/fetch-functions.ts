import axios from "axios";
import { BlogAuthor, BlogCategory, BlogTag } from "@/types/blog";

export const fetchAuthors = async () => {
  const response = await axios.get<{ results: BlogAuthor[] }>(
    `${process.env.NEXT_PUBLIC_API_URL}/api/authors/`
  );
  return response.data.results;
};

export const fetchCategories = async () => {
  const response = await axios.get<{ results: BlogCategory[] }>(
    `${process.env.NEXT_PUBLIC_API_URL}/api/categories/`
  );
  return response.data.results;
};

export const fetchTags = async () => {
  const response = await axios.get<{ results: BlogTag[] }>(
    `${process.env.NEXT_PUBLIC_API_URL}/api/tags/`
  );
  return response.data.results;
};
