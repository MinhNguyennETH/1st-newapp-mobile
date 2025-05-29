import axios from 'axios';

const API_KEY = 'fffcf2b8d2f64352b905695694eaa416';
const BASE_URL = 'https://newsapi.org/v2';
const PAGE_SIZE = 5; // Hiển thị 5 bài viết mỗi trang

const api = axios.create({
  baseURL: BASE_URL,
  params: {
    apiKey: API_KEY,
  },
});

export const getTopHeadlines = async (page = 1) => {
  try {
    const response = await api.get('/top-headlines', {
      params: {
        country: 'us', // Có thể thay đổi thành 'vn' cho tin tức tiếng Việt
        page,
        pageSize: PAGE_SIZE,
      },
    });
    return {
      articles: response.data.articles,
      totalResults: response.data.totalResults,
      currentPage: page,
      totalPages: Math.ceil(response.data.totalResults / PAGE_SIZE),
    };
  } catch (error) {
    console.error('Error fetching top headlines:', error);
    throw error;
  }
};

export const searchNews = async (query, page = 1) => {
  try {
    // Đảm bảo query không rỗng và có độ dài tối thiểu
    if (!query || query.trim().length < 2) {
      throw new Error('Search query must be at least 2 characters long');
    }

    const response = await api.get('/everything', {
      params: {
        q: query.trim(),
        page,
        pageSize: PAGE_SIZE,
        sortBy: 'publishedAt', // Sắp xếp theo thời gian xuất bản
        language: 'en', // Có thể thay đổi ngôn ngữ tùy theo yêu cầu
      },
    });
    return {
      articles: response.data.articles,
      totalResults: response.data.totalResults,
      currentPage: page,
      totalPages: Math.ceil(response.data.totalResults / PAGE_SIZE),
    };
  } catch (error) {
    if (error.response) {
      // Log chi tiết lỗi từ API
      console.error('API Error:', error.response.data);
    }
    console.error('Error searching news:', error);
    throw error;
  }
}; 