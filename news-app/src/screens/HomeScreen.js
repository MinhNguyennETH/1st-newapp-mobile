import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Alert, ScrollView, SafeAreaView, TextInput, RefreshControl } from 'react-native';
import { Searchbar, Text, Button } from 'react-native-paper';
import NewsCard from '../components/NewsCard';
import { getTopHeadlines, searchNews } from '../services/api';
import { isArticleBookmarked } from '../services/bookmarkService';

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

  const handleSearch = async (query, page = 1) => {
    if (query.trim() === '') {
      fetchNews(1);
      return;
    }

    if (query.trim().length < 2) {
      showError('Please enter at least 2 characters to search');
      return;
    }
    
    try {
      setLoading(true);
      const response = await searchNews(query, page);
      const { articles: newArticles, totalResults: total, totalPages: pages } = response;

      if (total === 0) {
        showError('No results found for your search');
      }

      setArticles(newArticles);
      setTotalResults(total);
      setTotalPages(pages);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error searching news:', error);
      showError(error.message || 'Failed to search news. Please try again.');
    } finally {
      setLoading(false);
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

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchNews(currentPage);
    });

    return unsubscribe;
  }, [navigation, currentPage]);

  const renderPagination = () => {
    const pages = [];
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

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

  const renderLoadingIndicator = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.loadingText}>Checking for new update...</Text>
          </View>
        </View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Tìm kiếm tin tức..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      <FlatList
        data={articles}
        keyExtractor={(item) => item.url}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        ListFooterComponent={
          <View>
            <View style={styles.paginationWrapper}>{renderPagination()}</View>
            <View style={styles.footer} />
          </View>
        }
      />
      {renderLoadingIndicator()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingBottom: 60,
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
    backgroundColor: '#f5f5f5',
    paddingVertical: 8,
    marginTop: 16,
    marginBottom: 60,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
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
  loadingOverlay: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1000,
  },
  loadingContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    marginLeft: 8,
    fontSize: 14,
  },
  searchInput: {
    height: 40,
    margin: 16,
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  footer: {
    height: 20,
  },
});

export default HomeScreen; 