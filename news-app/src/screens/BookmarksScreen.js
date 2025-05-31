// Import các thư viện và hooks cần thiết từ React và React Native
import React, { useState, useEffect } from 'react';
import {
  View, // Component để tạo container
  FlatList, // Component để hiển thị danh sách có thể cuộn
  StyleSheet, // API để tạo và quản lý styles
  Text, // Component để hiển thị văn bản
  ActivityIndicator, // Component hiển thị trạng thái đang tải
  SafeAreaView, // Component đảm bảo nội dung hiển thị trong vùng an toàn
  TextInput, // Component nhập liệu văn bản
} from 'react-native';
import { getBookmarks } from '../services/bookmarkService'; // Import hàm lấy danh sách đánh dấu
import NewsCard from '../components/NewsCard'; // Import component hiển thị thẻ tin tức
import { getTopHeadlines, searchNews } from '../services/api'; // Import các hàm gọi API

/**
 * Component màn hình hiển thị các bài viết đã đánh dấu
 * @param {Object} navigation - Đối tượng điều hướng từ React Navigation
 */
const BookmarksScreen = ({ navigation }) => {
  // Các state quản lý dữ liệu và trạng thái của màn hình
  const [bookmarks, setBookmarks] = useState([]); // Danh sách bài viết đã đánh dấu
  const [loading, setLoading] = useState(true); // Trạng thái đang tải
  const [searchQuery, setSearchQuery] = useState(''); // Từ khóa tìm kiếm
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const [totalPages, setTotalPages] = useState(1); // Tổng số trang

  /**
   * Tải danh sách các bài viết đã đánh dấu từ bộ nhớ cục bộ
   */
  const loadBookmarks = async () => {
    // Đặt trạng thái đang tải
    setLoading(true);
    // Lấy danh sách bài viết đã đánh dấu
    const savedBookmarks = await getBookmarks();
    // Cập nhật state với dữ liệu mới
    setBookmarks(savedBookmarks);
    // Kết thúc trạng thái đang tải
    setLoading(false);
  };

  /**
   * Lấy tin tức nổi bật từ API
   * @param {number} page - Số trang cần lấy (mặc định là 1)
   */
  const fetchNews = async (page = 1) => {
    try {
      // Đặt trạng thái đang tải
      setLoading(true);
      // Gọi API lấy tin tức nổi bật
      const response = await getTopHeadlines(page);
      // Cập nhật state với dữ liệu mới
      setBookmarks(response.articles);
      setTotalPages(response.totalPages);
      setCurrentPage(page);
    } catch (error) {
      // Xử lý lỗi (hàm showError chưa được định nghĩa trong code gốc)
      console.error('Không thể tải tin tức:', error);
    } finally {
      // Kết thúc trạng thái đang tải
      setLoading(false);
    }
  };

  /**
   * Xử lý tìm kiếm tin tức
   * @param {string} query - Từ khóa tìm kiếm
   * @param {number} page - Số trang cần lấy (mặc định là 1)
   */
  const handleSearch = async (query, page = 1) => {
    // Nếu từ khóa rỗng, lấy tin tức nổi bật
    if (query.trim() === '') {
      fetchNews(1);
      return;
    }
    try {
      // Đặt trạng thái đang tải
      setLoading(true);
      // Gọi API tìm kiếm tin tức
      const response = await searchNews(query, page);
      // Cập nhật state với dữ liệu mới
      setBookmarks(response.articles);
      setTotalPages(response.totalPages);
      setCurrentPage(page);
    } catch (error) {
      // Xử lý lỗi (hàm showError chưa được định nghĩa trong code gốc)
      console.error('Lỗi tìm kiếm tin tức:', error);
    } finally {
      // Kết thúc trạng thái đang tải
      setLoading(false);
    }
  };

  // Effect theo dõi sự kiện focus của màn hình
  useEffect(() => {
    // Đăng ký lắng nghe sự kiện focus
    const unsubscribe = navigation.addListener('focus', () => {
      // Tải lại danh sách bài viết đã đánh dấu khi màn hình được focus
      loadBookmarks();
    });

    // Hủy đăng ký khi component unmount
    return unsubscribe;
  }, [navigation]);

  // Hiển thị chỉ báo đang tải nếu đang tải dữ liệu
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0000ff" /> {/* Biểu tượng đang tải */}
      </View>
    );
  }

  // Hiển thị thông báo nếu không có bài viết đã đánh dấu
  if (bookmarks.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.noBookmarksText}>Không có tin tức đã lưu</Text>
      </View>
    );
  }

  // Render component chính khi có dữ liệu
  return (
    <SafeAreaView style={styles.container}>
      {/* Ô tìm kiếm */}
      <TextInput
        style={styles.searchInput}
        placeholder="Tìm kiếm tin tức..." // Gợi ý nhập
        value={searchQuery} // Giá trị hiện tại
        onChangeText={setSearchQuery} // Xử lý khi thay đổi văn bản
        onSubmitEditing={() => handleSearch(searchQuery)} // Xử lý khi nhấn Enter
        returnKeyType="search" // Kiểu nút Enter
      />
      {/* Danh sách bài viết đã đánh dấu */}
      <FlatList
        data={bookmarks} // Dữ liệu danh sách
        keyExtractor={(item) => item.url} // Hàm tạo key cho mỗi mục
        renderItem={({ item }) => (
          // Render mỗi bài viết bằng component NewsCard
          <NewsCard
            article={item} // Dữ liệu bài viết
            onPress={() => navigation.navigate('Details', { article: item })} // Xử lý khi nhấn vào bài viết
            isBookmarked={true} // Đánh dấu là đã được bookmark
          />
        )}
        contentContainerStyle={styles.listContainer} // Style cho container
      />
    </SafeAreaView>
  );
};

// Định nghĩa styles cho component
const styles = StyleSheet.create({
  container: {
    flex: 1, // Chiếm toàn bộ không gian có sẵn
    backgroundColor: '#f5f5f5', // Màu nền xám nhạt
  },
  centerContainer: {
    flex: 1, // Chiếm toàn bộ không gian có sẵn
    justifyContent: 'center', // Căn giữa theo chiều dọc
    alignItems: 'center', // Căn giữa theo chiều ngang
    backgroundColor: '#f5f5f5', // Màu nền xám nhạt
  },
  listContainer: {
    padding: 16, // Đệm xung quanh
  },
  noBookmarksText: {
    fontSize: 16, // Kích thước chữ
    color: '#666', // Màu chữ xám
  },
  searchInput: {
    height: 40, // Chiều cao
    borderColor: 'gray', // Màu viền
    borderWidth: 1, // Độ rộng viền
    margin: 10, // Khoảng cách xung quanh
    padding: 5, // Đệm nội dung
  },
});

// Export component để sử dụng ở nơi khác
export default BookmarksScreen; 