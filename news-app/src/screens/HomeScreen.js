// Import các thư viện và hooks cần thiết từ React và React Native
import React, { useState, useEffect } from 'react';
import { 
  View, // Component để tạo container
  FlatList, // Component để hiển thị danh sách có thể cuộn
  StyleSheet, // API để tạo và quản lý styles
  ActivityIndicator, // Component hiển thị trạng thái đang tải
  Alert, // API để hiển thị thông báo
  ScrollView, // Component tạo vùng có thể cuộn
  SafeAreaView, // Component đảm bảo nội dung hiển thị trong vùng an toàn
  TextInput, // Component nhập liệu văn bản
  RefreshControl // Component điều khiển làm mới
} from 'react-native';
import { Searchbar, Text, Button } from 'react-native-paper'; // Import từ thư viện UI React Native Paper
import NewsCard from '../components/NewsCard'; // Import component hiển thị thẻ tin tức
import { getTopHeadlines, searchNews } from '../services/api'; // Import các hàm gọi API
import { isArticleBookmarked } from '../services/bookmarkService'; // Import hàm kiểm tra trạng thái đánh dấu

/**
 * Component màn hình trang chủ hiển thị danh sách tin tức
 * @param {Object} navigation - Đối tượng điều hướng từ React Navigation
 */
const HomeScreen = ({ navigation }) => {
  // Các state quản lý dữ liệu và trạng thái của màn hình
  const [articles, setArticles] = useState([]); // Danh sách bài viết
  const [loading, setLoading] = useState(true); // Trạng thái đang tải
  const [searchQuery, setSearchQuery] = useState(''); // Từ khóa tìm kiếm
  const [refreshing, setRefreshing] = useState(false); // Trạng thái đang làm mới
  const [currentPage, setCurrentPage] = useState(1); // Trang hiện tại
  const [totalPages, setTotalPages] = useState(1); // Tổng số trang
  const [totalResults, setTotalResults] = useState(0); // Tổng số kết quả

  /**
   * Hiển thị thông báo lỗi
   * @param {string} message - Nội dung thông báo lỗi
   */
  const showError = (message) => {
    Alert.alert(
      'Error', // Tiêu đề thông báo
      message, // Nội dung thông báo
      [{ text: 'OK', onPress: () => console.log('OK Pressed') }] // Nút OK
    );
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
      // Phân rã dữ liệu từ response
      const { articles: newArticles, totalResults: total, totalPages: pages } = response;

      // Cập nhật state với dữ liệu mới
      setArticles(newArticles);
      setTotalResults(total);
      setTotalPages(pages);
      setCurrentPage(page);
    } catch (error) {
      // Xử lý lỗi
      console.error('Error fetching news:', error);
      showError('Failed to load news. Please try again later.');
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

    // Kiểm tra độ dài tối thiểu của từ khóa
    if (query.trim().length < 2) {
      showError('Please enter at least 2 characters to search');
      return;
    }
    
    try {
      // Đặt trạng thái đang tải
      setLoading(true);
      // Gọi API tìm kiếm tin tức
      const response = await searchNews(query, page);
      // Phân rã dữ liệu từ response
      const { articles: newArticles, totalResults: total, totalPages: pages } = response;

      // Hiển thị thông báo nếu không có kết quả
      if (total === 0) {
        showError('No results found for your search');
      }

      // Cập nhật state với dữ liệu mới
      setArticles(newArticles);
      setTotalResults(total);
      setTotalPages(pages);
      setCurrentPage(page);
    } catch (error) {
      // Xử lý lỗi
      console.error('Error searching news:', error);
      showError(error.message || 'Failed to search news. Please try again.');
    } finally {
      // Kết thúc trạng thái đang tải
      setLoading(false);
    }
  };

  /**
   * Xử lý khi người dùng chuyển trang
   * @param {number} page - Số trang cần chuyển đến
   */
  const handlePageChange = (page) => {
    // Nếu đang tìm kiếm, gọi API tìm kiếm với trang mới
    if (searchQuery) {
      handleSearch(searchQuery, page);
    } else {
      // Nếu không, lấy tin tức nổi bật với trang mới
      fetchNews(page);
    }
  };

  /**
   * Xử lý khi người dùng kéo xuống để làm mới
   */
  const handleRefresh = async () => {
    // Đặt trạng thái đang làm mới
    setRefreshing(true);
    // Nếu đang tìm kiếm, làm mới kết quả tìm kiếm
    if (searchQuery) {
      await handleSearch(searchQuery, 1);
    } else {
      // Nếu không, làm mới tin tức nổi bật
      await fetchNews(1);
    }
    // Kết thúc trạng thái đang làm mới
    setRefreshing(false);
  };

  // Effect chạy một lần khi component được mount
  useEffect(() => {
    // Lấy tin tức nổi bật khi màn hình được tải
    fetchNews(1);
  }, []);

  // Effect theo dõi sự kiện focus của màn hình
  useEffect(() => {
    // Đăng ký lắng nghe sự kiện focus
    const unsubscribe = navigation.addListener('focus', () => {
      // Làm mới dữ liệu khi màn hình được focus
      fetchNews(currentPage);
    });

    // Hủy đăng ký khi component unmount
    return unsubscribe;
  }, [navigation, currentPage]);

  /**
   * Render phần phân trang
   * @returns {JSX.Element} Component phân trang
   */
  const renderPagination = () => {
    const pages = []; // Mảng chứa các nút trang
    const maxButtons = 5; // Số nút trang tối đa hiển thị
    
    // Tính toán trang bắt đầu và kết thúc để hiển thị
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    // Điều chỉnh trang bắt đầu nếu không đủ số nút
    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    // Thêm nút trang trước nếu không phải trang đầu
    if (currentPage > 1) {
      pages.push(
        <Button
          key="prev"
          mode="text"
          onPress={() => handlePageChange(currentPage - 1)}
          style={styles.pageButton}
        >
          ← {/* Mũi tên trái */}
        </Button>
      );
    }

    // Thêm nút trang đầu tiên và dấu ... nếu cần
    if (startPage > 1) {
      pages.push(
        <Button
          key={1}
          mode={currentPage === 1 ? "contained" : "text"} // Kiểu nút dựa vào trang hiện tại
          onPress={() => handlePageChange(1)}
          style={styles.pageButton}
        >
          1 {/* Trang đầu tiên */}
        </Button>
      );
      // Thêm dấu ... nếu có khoảng cách
      if (startPage > 2) {
        pages.push(
          <Text key="dots1" style={styles.dots}>...</Text>
        );
      }
    }

    // Thêm các nút trang trong khoảng hiển thị
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          mode={currentPage === i ? "contained" : "text"} // Kiểu nút dựa vào trang hiện tại
          onPress={() => handlePageChange(i)}
          style={styles.pageButton}
        >
          {i} {/* Số trang */}
        </Button>
      );
    }

    // Thêm nút trang cuối cùng và dấu ... nếu cần
    if (endPage < totalPages) {
      // Thêm dấu ... nếu có khoảng cách
      if (endPage < totalPages - 1) {
        pages.push(
          <Text key="dots2" style={styles.dots}>...</Text>
        );
      }
      pages.push(
        <Button
          key={totalPages}
          mode={currentPage === totalPages ? "contained" : "text"} // Kiểu nút dựa vào trang hiện tại
          onPress={() => handlePageChange(totalPages)}
          style={styles.pageButton}
        >
          {totalPages} {/* Trang cuối cùng */}
        </Button>
      );
    }

    // Thêm nút trang sau nếu không phải trang cuối
    if (currentPage < totalPages) {
      pages.push(
        <Button
          key="next"
          mode="text"
          onPress={() => handlePageChange(currentPage + 1)}
          style={styles.pageButton}
        >
          → {/* Mũi tên phải */}
        </Button>
      );
    }

    // Trả về component ScrollView chứa các nút trang
    return (
      <ScrollView 
        horizontal // Cho phép cuộn ngang
        showsHorizontalScrollIndicator={false} // Ẩn thanh cuộn
        contentContainerStyle={styles.paginationContainer} // Style cho container
      >
        {pages} {/* Hiển thị các nút trang */}
      </ScrollView>
    );
  };

  /**
   * Render một mục tin tức
   * @param {Object} param0 - Đối tượng chứa thông tin bài viết
   * @returns {JSX.Element} Component NewsCard
   */
  const renderItem = ({ item }) => (
    <NewsCard
      article={item} // Dữ liệu bài viết
      onPress={() => navigation.navigate('Details', { article: item })} // Xử lý khi nhấn vào bài viết
    />
  );

  /**
   * Render chỉ báo đang tải
   * @returns {JSX.Element|null} Component chỉ báo đang tải hoặc null
   */
  const renderLoadingIndicator = () => {
    // Chỉ hiển thị khi đang tải và không phải đang làm mới
    if (loading && !refreshing) {
      return (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#007AFF" /> {/* Biểu tượng đang tải */}
            <Text style={styles.loadingText}>Checking for new update...</Text> {/* Thông báo đang tải */}
          </View>
        </View>
      );
    }
    return null;
  };

  // Render component chính
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
      {/* Danh sách bài viết */}
      <FlatList
        data={articles} // Dữ liệu danh sách
        keyExtractor={(item) => item.url} // Hàm tạo key cho mỗi mục
        renderItem={renderItem} // Hàm render mỗi mục
        contentContainerStyle={styles.listContainer} // Style cho container
        refreshControl={ // Điều khiển làm mới
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListFooterComponent={ // Component hiển thị ở cuối danh sách
          <View>
            <View style={styles.paginationWrapper}>{renderPagination()}</View> {/* Phân trang */}
            <View style={styles.footer} /> {/* Khoảng trống dưới cùng */}
          </View>
        }
      />
      {/* Hiển thị chỉ báo đang tải nếu cần */}
      {renderLoadingIndicator()}
    </SafeAreaView>
  );
};

// Định nghĩa styles cho component
const styles = StyleSheet.create({
  container: {
    flex: 1, // Chiếm toàn bộ không gian có sẵn
    backgroundColor: '#f5f5f5', // Màu nền xám nhạt
    paddingBottom: 60, // Đệm dưới
  },
  content: {
    flex: 1, // Chiếm toàn bộ không gian có sẵn
  },
  searchBar: {
    margin: 16, // Khoảng cách xung quanh
    elevation: 4, // Đổ bóng cho Android
  },
  loader: {
    flex: 1, // Chiếm toàn bộ không gian có sẵn
    justifyContent: 'center', // Căn giữa theo chiều dọc
    alignItems: 'center', // Căn giữa theo chiều ngang
  },
  list: {
    paddingVertical: 8, // Đệm trên dưới
    paddingBottom: 100, // Đệm dưới
  },
  emptyContainer: {
    flex: 1, // Chiếm toàn bộ không gian có sẵn
    justifyContent: 'center', // Căn giữa theo chiều dọc
    alignItems: 'center', // Căn giữa theo chiều ngang
    padding: 20, // Đệm xung quanh
  },
  emptyText: {
    fontSize: 16, // Kích thước chữ
    color: '#666', // Màu chữ xám
  },
  resultCount: {
    marginHorizontal: 16, // Khoảng cách trái phải
    marginBottom: 8, // Khoảng cách dưới
    fontSize: 14, // Kích thước chữ
    color: '#666', // Màu chữ xám
  },
  paginationWrapper: {
    backgroundColor: '#f5f5f5', // Màu nền xám nhạt
    paddingVertical: 8, // Đệm trên dưới
    marginTop: 16, // Khoảng cách trên
    marginBottom: 60, // Khoảng cách dưới
  },
  paginationContainer: {
    flexDirection: 'row', // Sắp xếp theo hàng ngang
    justifyContent: 'center', // Căn giữa theo chiều ngang
    alignItems: 'center', // Căn giữa theo chiều dọc
    paddingHorizontal: 16, // Đệm trái phải
  },
  pageButton: {
    marginHorizontal: 4, // Khoảng cách trái phải
    minWidth: 40, // Chiều rộng tối thiểu
    height: 40, // Chiều cao
  },
  dots: {
    marginHorizontal: 4, // Khoảng cách trái phải
    color: '#666', // Màu chữ xám
    fontSize: 16, // Kích thước chữ
  },
  loadingOverlay: {
    position: 'absolute', // Vị trí tuyệt đối
    top: 60, // Cách trên 60px
    left: 0, // Cách trái 0px
    right: 0, // Cách phải 0px
    alignItems: 'center', // Căn giữa theo chiều ngang
    zIndex: 1000, // Lớp hiển thị
  },
  loadingContainer: {
    flexDirection: 'row', // Sắp xếp theo hàng ngang
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Màu nền đen trong suốt
    paddingHorizontal: 16, // Đệm trái phải
    paddingVertical: 8, // Đệm trên dưới
    borderRadius: 20, // Bo tròn góc
    alignItems: 'center', // Căn giữa theo chiều dọc
  },
  loadingText: {
    color: 'white', // Màu chữ trắng
    marginLeft: 8, // Khoảng cách trái
    fontSize: 14, // Kích thước chữ
  },
  searchInput: {
    height: 40, // Chiều cao
    margin: 16, // Khoảng cách xung quanh
    padding: 10, // Đệm nội dung
    borderRadius: 8, // Bo tròn góc
    backgroundColor: 'white', // Màu nền trắng
    elevation: 2, // Đổ bóng cho Android
    shadowColor: '#000', // Màu bóng cho iOS
    shadowOffset: { width: 0, height: 1 }, // Vị trí bóng
    shadowOpacity: 0.2, // Độ mờ của bóng
    shadowRadius: 1.41, // Bán kính bóng
  },
  listContainer: {
    padding: 16, // Đệm xung quanh
    paddingBottom: 100, // Đệm dưới
  },
  footer: {
    height: 20, // Chiều cao
  },
});

// Export component để sử dụng ở nơi khác
export default HomeScreen; 