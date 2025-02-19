import React from 'react';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import LottieView from 'lottie-react-native';

const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{ borderLeftColor: '#ccc', width: 230, height: 40, borderRadius: 50 }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 15,
        fontWeight: '400',
      }}
      renderLeadingIcon={() => (
        <LottieView
          source={require('../assets/animations/success.json')}
          autoPlay
          style={{ width: 40, height: 40, marginRight: 10 }}
        />
      )}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      {...props}
      style={{ borderLeftColor: '#ccc', width: 230, height: 40, borderRadius: 50 }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 15,
        fontWeight: '400',
      }}
      renderLeadingIcon={() => (
        <LottieView
          source={require('../assets/animations/error.json')}
          autoPlay
          style={{ width: 40, height: 40, marginRight: 10 }}
        />
      )}
    />
  ),
  warning: (props: any) => (
    <BaseToast
      {...props}
      {...props}
      style={{ borderLeftColor: '#ccc', width: 230, height: 40, borderRadius: 50 }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 15,
        fontWeight: '400',
      }}
      renderLeadingIcon={() => (
        <LottieView
          source={require('../assets/animations/warning.json')}
          autoPlay
          style={{ width: 40, height: 40, marginRight: 10 }}
        />
      )}
    />
  ),
};

const ToastMessage = () => {
  return (
    <Toast
      config={toastConfig}
      topOffset={65} 
      visibilityTime={3000}
    />
  );
};

export default ToastMessage;
