// Import các thư viện cần thiết từ React và React Navigation
import React from 'react';
import { NavigationContainer } from '@react-navigation/native'; // Thư viện quản lý điều hướng
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'; // Tạo thanh điều hướng dưới cùng
import { createStackNavigator } from '@react-navigation/stack'; // Tạo điều hướng dạng ngăn xếp
import Icon from 'react-native-vector-icons/MaterialIcons'; // Thư viện biểu tượng

// Import các màn hình của ứng dụng
import HomeScreen from './src/screens/HomeScreen'; // Màn hình trang chủ
import DetailsScreen from './src/screens/DetailsScreen'; // Màn hình chi tiết bài viết
import BookmarksScreen from './src/screens/BookmarksScreen'; // Màn hình đánh dấu

// Khởi tạo các đối tượng điều hướng
const Stack = createStackNavigator(); // Tạo đối tượng điều hướng ngăn xếp
const Tab = createBottomTabNavigator(); // Tạo đối tượng điều hướng tab dưới cùng

// Định nghĩa ngăn xếp điều hướng cho màn hình Trang chủ
const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="HomeScreen" // Tên định danh cho màn hình
        component={HomeScreen} // Component sẽ được hiển thị
        options={{ title: 'Tin tức' }} // Tiêu đề hiển thị trên thanh điều hướng
      />
      <Stack.Screen 
        name="Details" // Tên định danh cho màn hình chi tiết
        component={DetailsScreen} // Component chi tiết bài viết
        options={{ title: 'Chi tiết' }} // Tiêu đề hiển thị
      />
    </Stack.Navigator>
  );
};

// Định nghĩa ngăn xếp điều hướng cho màn hình Đánh dấu
const BookmarksStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="BookmarksScreen" // Tên định danh cho màn hình đánh dấu
        component={BookmarksScreen} // Component màn hình đánh dấu
        options={{ title: 'Tin đã lưu' }} // Tiêu đề hiển thị
      />
      <Stack.Screen 
        name="Details" // Tên định danh cho màn hình chi tiết (dùng chung với HomeStack)
        component={DetailsScreen} // Component chi tiết bài viết
        options={{ title: 'Chi tiết' }} // Tiêu đề hiển thị
      />
    </Stack.Navigator>
  );
};

// Component chính của ứng dụng
export default function App() {
  return (
    <NavigationContainer> {/* Container chính quản lý tất cả điều hướng */}
      <Tab.Navigator
        screenOptions={({ route }) => ({
          // Cấu hình biểu tượng cho từng tab dựa trên route
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            // Xác định biểu tượng dựa trên tên route
            if (route.name === 'Home') {
              iconName = 'home'; // Biểu tượng trang chủ
            } else if (route.name === 'Bookmarks') {
              iconName = 'bookmark'; // Biểu tượng đánh dấu
            }
            // Trả về component Icon với các thuộc tính đã cấu hình
            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF', // Màu khi tab được chọn
          tabBarInactiveTintColor: 'gray', // Màu khi tab không được chọn
        })}
      >
        <Tab.Screen 
          name="Home" // Tên định danh cho tab trang chủ
          component={HomeStack} // Component ngăn xếp trang chủ
          options={{ 
            headerShown: false, // Ẩn thanh tiêu đề mặc định
            title: 'Trang chủ' // Tiêu đề hiển thị trên tab
          }}
        />
        <Tab.Screen 
          name="Bookmarks" // Tên định danh cho tab đánh dấu
          component={BookmarksStack} // Component ngăn xếp đánh dấu
          options={{ 
            headerShown: false, // Ẩn thanh tiêu đề mặc định
            title: 'Đã lưu' // Tiêu đề hiển thị trên tab
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
