/**
 * usePosts.js
 * ------------
 * Custom hook that fetches posts for a given feed level.
 * It handles loading state, errors, pagination, and like toggling.
 *
 * Usage in any component:
 *   const { posts, loading, error, loadMore, toggleLike } = usePosts('society')
 */

import { useState, useEffect, useCallback } from 'react'
import { postAPI } from '../services/api'
import toast from 'react-hot-toast'

export function usePosts(level) {
  const [posts, setPosts]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [page, setPage]       = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // Fetch posts whenever level changes (user switches tab)
  useEffect(() => {
    setPosts([])
    setPage(1)
    setHasMore(true)
    fetchPosts(1, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [level])

  async function fetchPosts(pageNum, reset = false) {
    try {
      setLoading(true)
      setError(null)
      const res = await postAPI.getFeed(level, { page: pageNum, limit: 10 })
      const newPosts = res.data.posts ?? []
      setPosts((prev) => (reset ? newPosts : [...prev, ...newPosts]))
      setHasMore(res.data.hasMore ?? false)
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load posts'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  function loadMore() {
    if (!hasMore || loading) return
    const next = page + 1
    setPage(next)
    fetchPosts(next)
  }

  // Toggle like on a post — optimistic update (UI changes immediately)
  const toggleLike = useCallback(async (postId) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p._id !== postId) return p
        const liked    = !p.likedByMe
        const likesCount = liked ? p.likesCount + 1 : p.likesCount - 1
        return { ...p, likedByMe: liked, likesCount }
      })
    )
    try {
      await postAPI.likePost(postId)
    } catch {
      // Revert on failure
      setPosts((prev) =>
        prev.map((p) => {
          if (p._id !== postId) return p
          const liked    = !p.likedByMe
          const likesCount = liked ? p.likesCount + 1 : p.likesCount - 1
          return { ...p, likedByMe: liked, likesCount }
        })
      )
      toast.error('Could not like post')
    }
  }, [])

  // Add a newly created post to the top of the feed
  function addPost(newPost) {
    setPosts((prev) => [newPost, ...prev])
  }

  // Remove a deleted post from the feed
  function removePost(postId) {
    setPosts((prev) => prev.filter((p) => p._id !== postId))
  }

  return { posts, loading, error, hasMore, loadMore, toggleLike, addPost, removePost }
}

/**
 * useInfiniteScroll.js
 * ---------------------
 * Detects when the user scrolls near the bottom and calls loadMore().
 *
 * Usage:
 *   const ref = useInfiniteScroll(loadMore, hasMore)
 *   <div ref={ref}>...</div>
 */
import { useRef } from 'react'

export function useInfiniteScroll(loadMore, hasMore) {
  const observer = useRef(null)

  const ref = useCallback(
    (node) => {
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) loadMore()
      })
      if (node) observer.current.observe(node)
    },
    [loadMore, hasMore]
  )

  return ref
}
