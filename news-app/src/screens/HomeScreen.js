import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Searchbar } from 'react-native-paper';
import NewsCard from '../components/NewsCard';
import { getTopHeadlines, searchNews } from '../services/api';
import * as Animatable from 'react-native-animatable';
import { Paragraph } from 'react-native-paper';

const HomeScreen = ({ navigation }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const showError = (message) => {
    Alert.alert(
      'Error',
      message,
      [{ text: 'OK', onPress: () => console.log('OK Pressed') }]
    );
  };

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await getTopHeadlines();
      setArticles(response.articles);
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
      showError('Please enter at least 2 characters to search');
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
      console.error('Error searching news:', error);
      showError(error.message || 'Failed to search news. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchNews();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const renderItem = ({ item, index }) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 100}
      useNativeDriver
    >
      <NewsCard
        article={item}
        onPress={() => navigation.navigate('Details', { article: item })}
      />
    </Animatable.View>
  );

  return (
    <View style={styles.container}>
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
        <FlatList
          data={articles}
          renderItem={renderItem}
          keyExtractor={(item) => item.url}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={styles.list}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Paragraph style={styles.emptyText}>
                No articles found
              </Paragraph>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
});

export default HomeScreen; 