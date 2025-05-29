import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Alert, ScrollView, SafeAreaView } from 'react-native';
import { Searchbar, Text, Button } from 'react-native-paper';
import NewsCard from '../components/NewsCard';
import { getTopHeadlines, searchNews } from '../services/api';

const HomeScreen = ({ navigation }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const showError = (message) => {
    Alert.alert(
      'Error',
      message,
      [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
    );
  };

  const fetchNews = async (page = 1) => {
    try {
      setLoading(true);
      const response = await getTopHeadlines(page);
      const { articles: newArticles, totalResults: total, totalPages: pages } = response;

      setArticles(newArticles);
      setTotalResults(total);
      setTotalPages(pages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error fetching news:', error);
      showError('Failed to load news. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    if (query.trim() === '') {
      fetchNews();
      return;
    }

    if (query.trim().length < 2) {
      showError('Please enter at least 2 characters to search'); // Báo lỗi nếu từ khóa dưới 2 ký tự
      return;
    }
    
    try {
      setLoading(true);
      const response = await searchNews(query);
      if (response.articles.length === 0) {
        showError('No results found for your search');
      }
      setArticles(response.articles);
    } catch (error) {
      console.error('Error searching news:', error); // Log lỗi nếu có
      showError(error.message || 'Failed to search news. Please try again.'); // Hiển thị thông báo lỗi
    } finally {
      setLoading(false); // Tắt trạng thái tải
    }
  };

  const handlePageChange = (page) => {
    if (searchQuery) {
      handleSearch(searchQuery, page);
    } else {
      fetchNews(page);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    if (searchQuery) {
      await handleSearch(searchQuery, 1);
    } else {
      await fetchNews(1);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    fetchNews(1);
  }, []);

  const renderPagination = () => {
    const pages = [];
    const maxButtons = 5; // Số lượng nút tối đa hiển thị
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    // Điều chỉnh lại startPage nếu endPage đã đạt giới hạn
    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    // Thêm nút Previous
    if (currentPage > 1) {
      pages.push(
        <Button
          key="prev"
          mode="text"
          onPress={() => handlePageChange(currentPage - 1)}
          style={styles.pageButton}
        >
          ←
        </Button>
      );
    }

    // Thêm nút trang đầu và dấu ...
    if (startPage > 1) {
      pages.push(
        <Button
          key={1}
          mode={currentPage === 1 ? "contained" : "text"}
          onPress={() => handlePageChange(1)}
          style={styles.pageButton}
        >
          1
        </Button>
      );
      if (startPage > 2) {
        pages.push(
          <Text key="dots1" style={styles.dots}>...</Text>
        );
      }
    }

    // Thêm các nút trang giữa
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          mode={currentPage === i ? "contained" : "text"}
          onPress={() => handlePageChange(i)}
          style={styles.pageButton}
        >
          {i}
        </Button>
      );
    }

    // Thêm nút trang cuối và dấu ...
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <Text key="dots2" style={styles.dots}>...</Text>
        );
      }
      pages.push(
        <Button
          key={totalPages}
          mode={currentPage === totalPages ? "contained" : "text"}
          onPress={() => handlePageChange(totalPages)}
          style={styles.pageButton}
        >
          {totalPages}
        </Button>
      );
    }

    // Thêm nút Next
    if (currentPage < totalPages) {
      pages.push(
        <Button
          key="next"
          mode="text"
          onPress={() => handlePageChange(currentPage + 1)}
          style={styles.pageButton}
        >
          →
        </Button>
      );
    }

    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.paginationContainer}
      >
        {pages}
      </ScrollView>
    );
  };

  const renderItem = ({ item }) => (
    <NewsCard
      article={item}
      onPress={() => navigation.navigate('Details', { article: item })}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <Searchbar
        placeholder="Search news..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        onSubmitEditing={() => handleSearch(searchQuery)}
        style={styles.searchBar}
      />
      
      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={styles.loader} />
      ) : (
        <View style={styles.content}>
          <Text style={styles.resultCount}>
            Found {totalResults} articles
          </Text>
          <FlatList
            data={articles}
            renderItem={renderItem}
            keyExtractor={(item, index) => `${item.url}-${index}`}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            contentContainerStyle={styles.list}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  No articles found
                </Text>
              </View>
            )}
          />
          {articles.length > 0 && (
            <View style={styles.paginationWrapper}>
              {renderPagination()}
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  searchBar: {
    margin: 16,
    elevation: 4,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingVertical: 8,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  resultCount: {
    marginHorizontal: 16,
    marginBottom: 8,
    fontSize: 14,
    color: '#666',
  },
  paginationWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    elevation: 4,
    paddingBottom: 20,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 8,
  },
  pageButton: {
    marginHorizontal: 4,
    minWidth: 40,
    height: 40,
  },
  dots: {
    marginHorizontal: 4,
    color: '#666',
    fontSize: 16,
  },
});

export default HomeScreen; 