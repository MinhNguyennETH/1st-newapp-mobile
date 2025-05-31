// Import thư viện axios để thực hiện các yêu cầu HTTP
import axios from 'axios';

// Các hằng số cấu hình cho API
const API_KEY = 'fffcf2b8d2f64352b905695694eaa416'; // Khóa API để xác thực với News API
const BASE_URL = 'https://newsapi.org/v2'; // URL cơ sở của News API
const PAGE_SIZE = 5; // Hiển thị 5 bài viết mỗi trang

// Tạo một instance axios với cấu hình mặc định
const api = axios.create({
  baseURL: BASE_URL, // Đặt URL cơ sở cho tất cả các yêu cầu
  params: {
    apiKey: API_KEY, // Thêm API key vào tất cả các yêu cầu
  },
});

/**
 * Lấy các tin tức nổi bật từ API
 * @param {number} page - Số trang cần lấy (mặc định là 1)
 * @returns {Object} Đối tượng chứa danh sách bài viết và thông tin phân trang
 */
export const getTopHeadlines = async (page = 1) => {
  try {
    // Gửi yêu cầu GET đến endpoint top-headlines
    const response = await api.get('/top-headlines', {
      params: {
        country: 'us', // Mã quốc gia, có thể thay đổi thành 'vn' cho tin tức tiếng Việt
        page, // Số trang cần lấy
        pageSize: PAGE_SIZE, // Số bài viết trên mỗi trang
      },
    });
    
    // Trả về dữ liệu đã được xử lý
    return {
      articles: response.data.articles, // Danh sách các bài viết
      totalResults: response.data.totalResults, // Tổng số bài viết có sẵn
      currentPage: page, // Trang hiện tại
      totalPages: Math.ceil(response.data.totalResults / PAGE_SIZE), // Tính tổng số trang
    };
  } catch (error) {
    // Ghi log lỗi và ném lại để xử lý ở tầng trên
    console.error('Error fetching top headlines:', error);
    throw error;
  }
};

/**
 * Tìm kiếm tin tức theo từ khóa
 * @param {string} query - Từ khóa tìm kiếm
 * @param {number} page - Số trang cần lấy (mặc định là 1)
 * @returns {Object} Đối tượng chứa danh sách bài viết và thông tin phân trang
 */
export const searchNews = async (query, page = 1) => {
  try {
    // Kiểm tra tính hợp lệ của từ khóa tìm kiếm
    // Đảm bảo query không rỗng và có độ dài tối thiểu
    if (!query || query.trim().length < 2) {
      throw new Error('Search query must be at least 2 characters long');
    }

    // Gửi yêu cầu GET đến endpoint everything để tìm kiếm
    const response = await api.get('/everything', {
      params: {
        q: query.trim(), // Từ khóa tìm kiếm (đã loại bỏ khoảng trắng thừa)
        page, // Số trang cần lấy
        pageSize: PAGE_SIZE, // Số bài viết trên mỗi trang
        sortBy: 'publishedAt', // Sắp xếp theo thời gian xuất bản (mới nhất trước)
        language: 'en', // Ngôn ngữ của bài viết, có thể thay đổi tùy theo yêu cầu
      },
    });
    
    // Trả về dữ liệu đã được xử lý
    return {
      articles: response.data.articles, // Danh sách các bài viết
      totalResults: response.data.totalResults, // Tổng số bài viết có sẵn
      currentPage: page, // Trang hiện tại
      totalPages: Math.ceil(response.data.totalResults / PAGE_SIZE), // Tính tổng số trang
    };
  } catch (error) {
    // Xử lý và ghi log lỗi
    if (error.response) {
      // Log chi tiết lỗi từ API nếu có
      console.error('API Error:', error.response.data);
    }
    console.error('Error searching news:', error);
    throw error; // Ném lại lỗi để xử lý ở tầng trên
  }
}; 