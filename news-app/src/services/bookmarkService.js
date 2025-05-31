// Import thư viện AsyncStorage để lưu trữ dữ liệu cục bộ
import AsyncStorage from '@react-native-async-storage/async-storage';

// Khóa để lưu trữ danh sách các bài viết đã đánh dấu trong AsyncStorage
const BOOKMARKS_KEY = '@news_bookmarks';

/**
 * Lấy danh sách tất cả các bài viết đã đánh dấu
 * @returns {Promise<Array>} Mảng chứa các bài viết đã đánh dấu
 */
export const getBookmarks = async () => {
  try {
    // Lấy chuỗi JSON từ AsyncStorage
    const bookmarksJson = await AsyncStorage.getItem(BOOKMARKS_KEY);
    // Chuyển đổi chuỗi JSON thành mảng JavaScript, nếu không có dữ liệu thì trả về mảng rỗng
    return bookmarksJson ? JSON.parse(bookmarksJson) : [];
  } catch (error) {
    // Xử lý lỗi và ghi log
    console.error('Error getting bookmarks:', error);
    // Trả về mảng rỗng trong trường hợp có lỗi
    return [];
  }
};

/**
 * Lưu một bài viết vào danh sách đánh dấu
 * @param {Object} article - Đối tượng bài viết cần lưu
 * @returns {Promise<boolean>} True nếu lưu thành công, False nếu bài viết đã tồn tại hoặc có lỗi
 */
export const saveBookmark = async (article) => {
  try {
    // Lấy danh sách các bài viết đã đánh dấu hiện tại
    const bookmarks = await getBookmarks();
    // Kiểm tra xem bài viết đã được đánh dấu chưa (dựa trên URL)
    const isBookmarked = bookmarks.some((bookmark) => bookmark.url === article.url);
    
    // Nếu bài viết chưa được đánh dấu
    if (!isBookmarked) {
      // Tạo mảng mới bao gồm tất cả các bài viết cũ và bài viết mới
      const updatedBookmarks = [...bookmarks, article];
      // Lưu mảng mới vào AsyncStorage
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
      // Trả về true để chỉ ra rằng đã lưu thành công
      return true;
    }
    // Trả về false nếu bài viết đã tồn tại trong danh sách đánh dấu
    return false;
  } catch (error) {
    // Xử lý lỗi và ghi log
    console.error('Error saving bookmark:', error);
    // Trả về false trong trường hợp có lỗi
    return false;
  }
};

/**
 * Xóa một bài viết khỏi danh sách đánh dấu
 * @param {string} articleUrl - URL của bài viết cần xóa
 * @returns {Promise<boolean>} True nếu xóa thành công, False nếu có lỗi
 */
export const removeBookmark = async (articleUrl) => {
  try {
    // Lấy danh sách các bài viết đã đánh dấu hiện tại
    const bookmarks = await getBookmarks();
    // Lọc ra các bài viết không có URL trùng với bài viết cần xóa
    const updatedBookmarks = bookmarks.filter((bookmark) => bookmark.url !== articleUrl);
    // Lưu mảng đã cập nhật vào AsyncStorage
    await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updatedBookmarks));
    // Trả về true để chỉ ra rằng đã xóa thành công
    return true;
  } catch (error) {
    // Xử lý lỗi và ghi log
    console.error('Error removing bookmark:', error);
    // Trả về false trong trường hợp có lỗi
    return false;
  }
};

/**
 * Kiểm tra xem một bài viết đã được đánh dấu hay chưa
 * @param {string} articleUrl - URL của bài viết cần kiểm tra
 * @returns {Promise<boolean>} True nếu bài viết đã được đánh dấu, False nếu chưa hoặc có lỗi
 */
export const isArticleBookmarked = async (articleUrl) => {
  try {
    // Lấy danh sách các bài viết đã đánh dấu
    const bookmarks = await getBookmarks();
    // Kiểm tra xem có bài viết nào có URL trùng với URL cần kiểm tra không
    return bookmarks.some((bookmark) => bookmark.url === articleUrl);
  } catch (error) {
    // Xử lý lỗi và ghi log
    console.error('Error checking bookmark status:', error);
    // Trả về false trong trường hợp có lỗi
    return false;
  }
}; 