// src/screens/Auth/LoginScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  Animated,
  Dimensions,
  StatusBar
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import api from '../../services/api';

const isWeb = Platform.OS === 'web';
const isWindows = Platform.OS === 'windows' || (isWeb && /Windows/.test(navigator.userAgent));

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Animaciones
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Campos vacíos', 'Por favor, completa ambos campos.');
      return;
    }
    
    try {
      setIsLoading(true);
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Alert.alert('Email inválido', 'Por favor, introduce un email válido.');
        setIsLoading(false);
        return;
      }

      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;

      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userId', user.id);
      await AsyncStorage.setItem('userRole', user.role);

      navigation.replace('HomeScreen');
    } catch (error) {
      console.error('Error de login:', error);
      
      if (error.response) {
        if (error.response.status === 401) {
          Alert.alert('Acceso denegado', 'Email o contraseña incorrectos.');
        } else {
          Alert.alert('Error', `Error del servidor: ${error.response.status}`);
        }
      } else if (error.request) {
        Alert.alert('Sin conexión', 'No se pudo conectar con el servidor. Comprueba tu conexión a internet.');
      } else {
        Alert.alert('Error', 'Ocurrió un problema al intentar iniciar sesión.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const goToHome = () => {
    navigation.navigate('HomeScreen');
  };
  const goToRegister = () => {
    navigation.navigate('RegisterScreen');
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      <LinearGradient
        colors={['#E8F5E9', '#C8E6C9', '#FFFFFF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.background}
      >
        <KeyboardAvoidingView
          style={styles.innerContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : null}
          enabled={!isWindows}
        >
          <Animated.View 
            style={[
              styles.logoContainer, 
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            {/* Logo circular con imagen */}
            <View style={styles.logoCircle}>
              <Image 
                source={require('../../assets/images/logo.png')} 
                style={styles.logoImage}
              />
            </View>
            <Text style={styles.title}>StageLink</Text>
            <Text style={styles.subtitle}>Conecta músicos y organizadores</Text>
          </Animated.View>
  
          <Animated.View 
            style={[
              styles.formContainer, 
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
            ]}
          >
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={22} color="#BDC3C7" style={styles.inputIcon} />
              <TextInput
                placeholder="Email"
                placeholderTextColor="rgba(189, 195, 199, 0.6)"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
              />
            </View>
            
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={22} color="#BDC3C7" style={styles.inputIcon} />
              <TextInput
                placeholder="Contraseña"
                placeholderTextColor="rgba(189, 195, 199, 0.6)"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                style={styles.input}
              />
              <TouchableOpacity 
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons 
                  name={showPassword ? "eye-off-outline" : "eye-outline"} 
                  size={22} 
                  color="#BDC3C7" 
                />
              </TouchableOpacity>
            </View>
  
            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
  
            <TouchableOpacity 
              style={styles.button} 
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                isWindows ? (
                  <Text style={styles.buttonText}>Cargando...</Text>
                ) : (
                  <LottieView
                    source={require('../../assets/animations/loading.json')}
                    autoPlay
                    loop
                    style={styles.loadingAnimation}
                  />
                )
              ) : (
                <Text style={styles.buttonText}>Iniciar Sesión</Text>
              )}
            </TouchableOpacity>
  
            <View style={styles.socialContainer}>
              <Text style={styles.orText}>O continúa con</Text>
              <View style={styles.socialButtons}>
                <TouchableOpacity style={styles.socialButton}>
                  <Ionicons name="logo-google" size={24} color="#BDC3C7" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <Ionicons name="logo-facebook" size={24} color="#BDC3C7" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialButton}>
                  <Ionicons name="logo-apple" size={24} color="#BDC3C7" />
                </TouchableOpacity>
              </View>
            </View>
  
            <TouchableOpacity onPress={goToRegister} style={styles.registerButton}>
              <Text style={styles.registerText}>
                ¿No tienes cuenta? <Text style={styles.registerTextBold}>Regístrate</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: Platform.OS === 'android' ? 50 : 0,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
    borderWidth: 2,
    borderColor: '#C8E6C9',
  },
  logoImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
  },
  title: {
    fontSize: 38,
    fontWeight: '800',
    color: '#2E7D32',
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#66BB6A',
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  formContainer: {
    width: '100%',
    maxWidth: 350,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(232, 245, 233, 0.8)',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    color: '#2E7D32',
    fontSize: 16,
  },
  eyeIcon: {
    padding: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#388E3C',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#2E7D32',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#1B5E20',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  loadingAnimation: {
    width: 50,
    height: 50,
  },
  socialContainer: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  orText: {
    color: '#388E3C',
    marginBottom: 15,
    fontSize: 14,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(232, 245, 233, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 10,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  registerButton: {
    paddingVertical: 10,
  },
  registerText: {
    color: '#388E3C',
    fontSize: 14,
    textAlign: 'center',
  },
  registerTextBold: {
    fontWeight: 'bold',
    color: '#2E7D32',
  },
});
