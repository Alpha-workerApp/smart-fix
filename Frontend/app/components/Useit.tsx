import { Image, View, Text } from 'react-native'
import React from 'react'

const Useit = () => {
  return (
    <View>
      <Image source={require("../../assets/icons/quote-icon.png")} className='size-14 my-4' />
      <Text className='text-[15px] mt-3 font-nunito-medium text-justify'>
      To use this application, start by signing in with your preferred login method. If you are a new user, register by providing your details such as full name, email, phone number, and password. During registration, select your user type—Customer or Worker—for a personalized experience. Once signed in, navigate through the intuitive tab-based interface to access various features. Use the search functionality to quickly find technicians or services that match your needs. You can view detailed worker profiles, check their availability status, and monitor services in real time. Stay updated with notifications and in-app messaging for seamless communication. Enjoy easy access to professional services with a smooth and user-friendly experience.
      </Text>
    </View>
  )
}

export default Useit