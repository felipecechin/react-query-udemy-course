import { useEffect, useState } from "react";

import { PostDetail } from "./PostDetail";
import { useQuery, useQueryClient } from "react-query";
const maxPostPage = 10;

async function fetchPosts(pageNum) {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/posts?_limit=10&_page=${pageNum}`
  );
  return response.json();
}

export function Posts() {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState(null);


  const queryClient = useQueryClient();

  useEffect(() => {
    if (currentPage < maxPostPage) {
      queryClient.prefetchQuery(["posts", currentPage + 1], () => fetchPosts(currentPage + 1))
    }
  }, [currentPage, queryClient])

  // replace with useQuery
  const {data, isError, isLoading, error} = useQuery(
    ["posts", currentPage],
    () => fetchPosts(currentPage),
    {
      staleTime: 2000,
      keepPreviousData: true,
    }
  )

  if (isLoading) return <h3>Loading...</h3>;
  if (isError) return <><h3>Something went wrong</h3><p>{error.toString()}</p></>;

  return (
    <>
      <ul>
        {data.map((post) => (
          <li
            key={post.id}
            className="post-title"
            onClick={() => setSelectedPost(post)}
          >
            {post.title}
          </li>
        ))}
      </ul>
      <div className="pages">
        <button disabled={currentPage <= 1} onClick={() => {
          setCurrentPage(previousPage => previousPage - 1)
        }}>
          Previous page
        </button>
        <span>Page {currentPage}</span>
        <button disabled={currentPage >= maxPostPage} onClick={() => {
          setCurrentPage(previousPage => previousPage + 1)
        }}>
          Next page
        </button>
      </div>
      <hr />
      {selectedPost && <PostDetail post={selectedPost} />}
    </>
  );
}
