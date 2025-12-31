/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  FlatList,
  Keyboard,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';

const App = () => {
  // --- Weather State ---
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // --- Counter State ---
  const [count, setCount] = useState(0);

  // --- Todo State ---
  const [task, setTask] = useState('');
  const [todoList, setTodoList] = useState<any[]>([]);

  // ==========================
  // 1. WEATHER FUNCTIONS
  // ==========================
  const fetchWeather = async () => {
    if (!city.trim()) return;

    Keyboard.dismiss();
    setLoading(true);
    setWeather(null);

    try {
      // Step 1: Find the City (Geocoding) to get Latitude/Longitude
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${city}&count=1&language=en&format=json`;
      const geoResponse = await fetch(geoUrl);
      const geoData = await geoResponse.json();

      if (!geoData.results || geoData.results.length === 0) {
        Alert.alert('Error', 'City not found. Try a major city name.');
        setLoading(false);
        return;
      }

      const { latitude, longitude, name, country } = geoData.results[0];

      // Step 2: Get Weather Data using Lat/Lon
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;
      const weatherResponse = await fetch(weatherUrl);
      const weatherData = await weatherResponse.json();

      setWeather({
        name: name,
        country: country,
        temp: weatherData.current_weather.temperature,
        wind: weatherData.current_weather.windspeed,
        // Helper to translate code to text
        desc: getWeatherDescription(weatherData.current_weather.weathercode),
      });

    } catch (error) {
      Alert.alert('Error', 'Could not fetch weather. Check internet connection.');
    } finally {
      setLoading(false);
    }
  };

  // Helper: Convert WMO Weather Codes to text
  const getWeatherDescription = (code: number) => {
    if (code === 0) return 'Clear Sky ☀️';
    if (code >= 1 && code <= 3) return 'Partly Cloudy ⛅';
    if (code >= 45 && code <= 48) return 'Foggy 🌫️';
    if (code >= 51 && code <= 67) return 'Rainy 🌧️';
    if (code >= 71 && code <= 77) return 'Snow ❄️';
    if (code >= 95) return 'Thunderstorm ⚡';
    return 'Overcast ☁️';
  };

  // ==========================
  // 2. TODO FUNCTIONS
  // ==========================
  const handleAddTask = () => {
    if (task.trim().length === 0) return;
    const newTodo = { id: Date.now().toString(), text: task, completed: false };
    setTodoList([...todoList, newTodo]);
    setTask('');
    Keyboard.dismiss();
  };

  const toggleTask = (id: string) => {
    setTodoList(todoList.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  const handleDeleteTask = (id: string) => {
    setTodoList(todoList.filter(item => item.id !== id));
  };

  // ==========================
  // 3. UI RENDER
  // ==========================

  // We use ListHeaderComponent to make the Weather and Counter scrollable along with the list
  const renderHeader = () => (
    <View>
      <Text style={styles.appTitle}>My Dashboard</Text>

      {/* --- WEATHER SECTION --- */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Weather Forecast</Text>

        <View style={styles.weatherInputRow}>
          <TextInput
            style={styles.weatherInput}
            placeholder="Enter City (e.g. London)"
            value={city}
            onChangeText={setCity}
          />
          <TouchableOpacity style={styles.searchBtn} onPress={fetchWeather}>
            <Text style={styles.searchBtnText}>Search</Text>
          </TouchableOpacity>
        </View>

        {loading && <ActivityIndicator size="large" color="#55BCF6" style={{ marginTop: 10 }} />}

        {weather && (
          <View style={styles.weatherInfo}>
            <Text style={styles.weatherCity}>{weather.name}, {weather.country}</Text>
            <Text style={styles.weatherTemp}>{weather.temp}°C</Text>
            <Text style={styles.weatherDesc}>{weather.desc}</Text>
            <Text style={styles.weatherWind}>Wind: {weather.wind} km/h</Text>
          </View>
        )}
      </View>

      {/* --- COUNTER SECTION --- */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Counter</Text>
        <View style={styles.counterRow}>
          <TouchableOpacity style={[styles.cntBtn, styles.minusBtn]} onPress={() => setCount(count - 1)}>
            <Text style={styles.btnText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.counterText}>{count}</Text>
          <TouchableOpacity style={[styles.cntBtn, styles.plusBtn]} onPress={() => setCount(count + 1)}>
            <Text style={styles.btnText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* --- TODO INPUT --- */}
      <Text style={styles.sectionTitle}>Tasks</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          placeholder="Add a new task..."
          value={task}
          onChangeText={setTask}
        />
        <TouchableOpacity onPress={handleAddTask}>
          <View style={styles.addWrapper}>
            <Text style={styles.addText}>+</Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#f0f2f5" barStyle="dark-content" />

      <FlatList
        data={todoList}
        keyExtractor={item => item.id}
        style={styles.listSection}
        contentContainerStyle={{ paddingBottom: 50, paddingTop: 20 }}
        ListHeaderComponent={renderHeader} // Keeps everything scrollable together
        renderItem={({ item }) => (
          <View style={styles.item}>
            <TouchableOpacity style={styles.itemLeft} onPress={() => toggleTask(item.id)}>
              <View style={[styles.square, item.completed && styles.squareCompleted]}>
                {item.completed && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={[styles.itemText, item.completed && styles.itemTextCompleted]}>
                {item.text}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDeleteTask(item.id)}>
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f2f5' },
  listSection: { paddingHorizontal: 20 },
  appTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#555', marginTop: 10 },

  // Card Generic Style
  card: { backgroundColor: 'white', padding: 20, borderRadius: 15, marginBottom: 20, elevation: 3 },

  // Weather Styles
  weatherInputRow: { flexDirection: 'row', gap: 10 },
  weatherInput: { flex: 1, borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 10, backgroundColor: '#f9f9f9' },
  searchBtn: { backgroundColor: '#55BCF6', padding: 12, borderRadius: 10, justifyContent: 'center' },
  searchBtnText: { color: 'white', fontWeight: 'bold' },
  weatherInfo: { alignItems: 'center', marginTop: 15 },
  weatherCity: { fontSize: 20, fontWeight: 'bold', color: '#333' },
  weatherTemp: { fontSize: 40, fontWeight: 'bold', color: '#333' },
  weatherDesc: { fontSize: 18, color: '#666', marginVertical: 5 },
  weatherWind: { fontSize: 14, color: '#999' },

  // Counter Styles
  counterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 40 },
  counterText: { fontSize: 40, fontWeight: 'bold', color: '#333' },
  cntBtn: { width: 50, height: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 25 },
  minusBtn: { backgroundColor: '#ff6b6b' },
  plusBtn: { backgroundColor: '#51cf66' },
  btnText: { fontSize: 25, color: 'white', fontWeight: 'bold' },

  // Todo Input Styles
  inputWrapper: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  input: { paddingVertical: 15, paddingHorizontal: 20, backgroundColor: 'white', borderRadius: 60, borderColor: '#C0C0C0', borderWidth: 1, width: '80%', color: 'black' },
  addWrapper: { width: 50, height: 50, backgroundColor: 'white', borderRadius: 60, justifyContent: 'center', alignItems: 'center', borderColor: '#C0C0C0', borderWidth: 1, elevation: 2 },
  addText: { fontSize: 25, color: '#555' },

  // Todo Item Styles
  item: { backgroundColor: 'white', padding: 15, borderRadius: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 15, elevation: 1 },
  itemLeft: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', flex: 1 },
  square: { width: 24, height: 24, backgroundColor: '#55BCF6', opacity: 0.4, borderRadius: 5, marginRight: 15, alignItems: 'center', justifyContent: 'center' },
  squareCompleted: { backgroundColor: '#51cf66', opacity: 1 },
  checkmark: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  itemText: { maxWidth: '80%', fontSize: 16, color: '#333' },
  itemTextCompleted: { textDecorationLine: 'line-through', color: '#aaa' },
  deleteText: { color: 'red', fontSize: 12, fontWeight: 'bold', marginLeft: 10 },
});

export default App;