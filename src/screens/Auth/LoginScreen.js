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

// Para soporte en Windows, usamos una detección de plataforma
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
  const windowWidth = Dimensions.get('window').width;
  
  useEffect(() => {
    // Efecto de entrada animada
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
      
      // Validación básica de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        Alert.alert('Email inválido', 'Por favor, introduce un email válido.');
        setIsLoading(false);
        return;
      }

      // Petición al backend adaptada para diferentes plataformas
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;

      // Guardar datos en AsyncStorage (funciona en todas las plataformas)
      await AsyncStorage.setItem('userToken', token);
      await AsyncStorage.setItem('userId', user.id);
      await AsyncStorage.setItem('userRole', user.role);

      // Redireccionar
      navigation.replace('RegisterScreen');
    } catch (error) {
      console.error('Error de login:', error);
      
      // Mensajes de error más específicos
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

  const goToRegister = () => {
    navigation.navigate('RegisterScreen');
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      <LinearGradient
        colors={['#1E2130', '#2C3E50', '#34495E']}
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
            {/* Logo circular con efecto de sombra */}
            <View style={styles.logoCircle}>
              <Text style={styles.logoText}>SL</Text>
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
      backgroundColor: 'rgba(41, 128, 185, 0.8)',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 15,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      elevation: 8,
      borderWidth: 2,
      borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    logoText: {
      fontSize: 30,
      fontWeight: '900',
      color: '#ECF0F1',
    },
    title: {
      fontSize: 38,
      fontWeight: '800',
      color: '#ECF0F1',
      marginBottom: 10,
      textShadowColor: 'rgba(0, 0, 0, 0.3)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
      letterSpacing: 1,
    },
    subtitle: {
      fontSize: 16,
      color: '#BDC3C7',
      marginBottom: 10,
      letterSpacing: 0.5,
    },
    formContainer: {
      width: '100%',
      maxWidth: 350,
      backgroundColor: 'rgba(30, 39, 46, 0.85)',
      borderRadius: 15,
      padding: 25,
      backdropFilter: 'blur(10px)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 10,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(23, 32, 42, 0.7)',
      borderRadius: 8,
      marginBottom: 15,
      paddingHorizontal: 15,
      borderWidth: 1,
      borderColor: 'rgba(189, 195, 199, 0.1)',
    },
    inputIcon: {
      marginRight: 10,
    },
    input: {
      flex: 1,
      paddingVertical: 15,
      color: '#ECF0F1',
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
      color: '#7F8C8D',
      fontSize: 14,
    },
    button: {
      backgroundColor: '#2980B9',
      paddingVertical: 15,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
      shadowColor: '#154360',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.4,
      shadowRadius: 5,
      elevation: 5,
    },
    buttonText: {
      color: '#ECF0F1',
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
      color: '#7F8C8D',
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
      backgroundColor: 'rgba(23, 32, 42, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      marginHorizontal: 10,
      borderWidth: 1,
      borderColor: 'rgba(189, 195, 199, 0.1)',
    },
    registerButton: {
      paddingVertical: 10,
    },
    registerText: {
      color: '#7F8C8D',
      fontSize: 14,
      textAlign: 'center',
    },
    registerTextBold: {
      fontWeight: 'bold',
      color: '#3498DB',
    },
  });