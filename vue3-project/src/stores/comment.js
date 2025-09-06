import { defineStore } from 'pinia'
import { ref } from 'vue'
import { commentApi } from '@/api/index.js'
import { formatTime } from '@/utils/timeFormat'

export const useCommentStore = defineStore('comment', () => {
    // 存储笔记的评论数据 { postId: { comments: Array, loading: boolean, loaded: boolean, hasMore: boolean, page: number } }
    const postComments = ref(new Map())

    // 获取笔记评论（支持分页）
    const fetchComments = async (postId, params = {}) => {
        const currentData = postComments.value.get(postId)
        const isLoadMore = params.page > 1

        // 如果已经在加载中，则不重复请求
        if (currentData?.loading) {
            return currentData?.comments || []
        }

        // 设置加载状态
        postComments.value.set(postId, {
            ...currentData,
            loading: true,
            loaded: isLoadMore ? currentData?.loaded : false
        })

        try {
            const response = await commentApi.getComments(postId, params)

            // 检查响应是否存在
            if (!response) {
                console.error(`笔记[${postId}]评论获取失败，响应为空`)
                throw new Error('响应数据为空')
            }

            if (response.success && response.data && response.data.comments) {
                // 处理顶级评论数据格式
                const parentComments = response.data.comments.map(comment => ({
                    id: comment.id,
                    user_id: comment.user_display_id || comment.user_id, // 大红薯号（用于导航）
                    user_auto_id: comment.user_auto_id || comment.user_id, // 用户自增ID（用于权限判断）
                    username: comment.nickname || '匿名用户',
                    avatar: comment.user_avatar || new URL('@/assets/imgs/avatar.png', import.meta.url).href,
                    content: comment.content,
                    time: formatTime(comment.created_at),
                    location: comment.user_location || comment.location,
                    likeCount: comment.like_count || 0,
                    isLiked: comment.liked || false,
                    parent_id: comment.parent_id,
                    replies: [], // 初始为空，懒加载
                    reply_count: comment.reply_count || 0, // 子评论数量
                    isReply: false, // 顶级评论
                    repliesLoaded: false, // 子评论是否已加载
                    showReplies: false // 是否显示子评论
                }));

                // 获取分页信息
                const currentData = postComments.value.get(postId)
                const existingComments = isLoadMore ? (currentData?.comments || []) : []
                const allComments = isLoadMore ? [...existingComments, ...parentComments] : parentComments

                // 更新评论数据
                postComments.value.set(postId, {
                    comments: allComments,
                    totalCount: response.data.pagination?.total || allComments.length,
                    hasMore: response.data.pagination ? response.data.pagination.hasMore : parentComments.length >= 20,
                    page: params.page || 1,
                    loading: false,
                    loaded: true
                })

                return allComments
            } else {
                console.error(`笔记[${postId}]评论获取失败，响应结构:`, {
                    success: response.success,
                    hasData: !!response.data,
                    message: response.message || '未知错误'
                })

                // 设置加载失败状态
                postComments.value.set(postId, {
                    ...postComments.value.get(postId),
                    loading: false,
                    loaded: false,
                    comments: []
                })
                return []
            }
        } catch (error) {
            console.error(`获取笔记[${postId}]评论失败:`, error)
            // 设置加载失败状态
            postComments.value.set(postId, {
                ...postComments.value.get(postId),
                loading: false,
                loaded: false,
                comments: []
            })
            return []
        }
    }

    // 计算所有评论的总数（包括顶级评论和所有回复）
    const calculateTotalComments = (comments) => {
        let total = comments.length // 顶级评论数量
        comments.forEach(comment => {
            if (comment.replies && comment.replies.length > 0) {
                total += comment.replies.length // 添加回复数量
            }
        })
        return total
    }

    // 添加评论
    const addComment = (postId, comment) => {
        const currentData = postComments.value.get(postId) || { comments: [], loading: false, loaded: true }
        const newComments = [comment, ...currentData.comments]

        postComments.value.set(postId, {
            ...currentData,
            comments: newComments,
            total: (currentData.total || 0) + 1
        })
    }

    // 更新评论数据
    const updateComments = (postId, newData) => {
        const currentData = postComments.value.get(postId) || { comments: [], loading: false, loaded: true }
        postComments.value.set(postId, {
            ...currentData,
            ...newData
        })
    }

    // 获取评论数据
    const getComments = (postId) => {
        return postComments.value.get(postId) || { comments: [], loading: false, loaded: false, total: 0 }
    }

    // 清除评论数据
    const clearComments = (postId) => {
        if (postId) {
            postComments.value.delete(postId)
        } else {
            postComments.value.clear()
        }
    }

    // 懒加载某个评论的回复
    const loadCommentReplies = async (postId, commentId) => {
        try {
            const response = await commentApi.getReplies(commentId)
            if (response.success && response.data && response.data.comments) {
                const replies = response.data.comments.map(reply => {
                    // 查找被回复的评论或用户信息
                    let replyToUsername = '未知用户'
                    const parentInReplies = response.data.comments.find(r => r.id === reply.parent_id)
                    if (parentInReplies) {
                        replyToUsername = parentInReplies.nickname || '匿名用户'
                    }

                    return {
                        id: reply.id,
                        user_id: reply.user_display_id || reply.user_id,
                        user_auto_id: reply.user_auto_id || reply.user_id,
                        username: reply.nickname || '匿名用户',
                        avatar: reply.user_avatar || new URL('@/assets/imgs/avatar.png', import.meta.url).href,
                        content: reply.content,
                        time: formatTime(reply.created_at),
                        location: reply.user_location || reply.location,
                        likeCount: reply.like_count || 0,
                        isLiked: reply.liked || false,
                        parent_id: reply.parent_id,
                        replyTo: replyToUsername,
                        replies: [],
                        isReply: true
                    }
                })

                // 更新对应评论的回复数据
                const postData = postComments.value.get(postId)
                if (postData) {
                    const targetComment = postData.comments.find(c => c.id === commentId)
                    if (targetComment) {
                        targetComment.replies = replies
                        targetComment.repliesLoaded = true
                        targetComment.showReplies = true
                    }
                }

                return replies
            }
        } catch (error) {
            console.error(`加载评论[${commentId}]的回复失败:`, error)
        }
        return []
    }

    // 切换回复显示状态
    const toggleReplies = (postId, commentId) => {
        const postData = postComments.value.get(postId)
        if (postData) {
            const targetComment = postData.comments.find(c => c.id === commentId)
            if (targetComment) {
                targetComment.showReplies = !targetComment.showReplies
            }
        }
    }

    return {
        fetchComments,
        addComment,
        updateComments,
        getComments,
        clearComments,
        loadCommentReplies,
        toggleReplies
    }
})
