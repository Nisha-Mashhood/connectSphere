import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { handleError } from "./ErrorHandler";

export const registerSW = async () => {
    if (!("serviceWorker" in navigator)) {
      console.error("Service Worker is not supported in this browser.");
      return;
    }
    const permission = await Notification.requestPermission();
    if(permission !== 'granted') return;
  
    try {
      const SW = await navigator.serviceWorker.register("/custom-sw.js"); 
  
    // const subscription = await registration.pushManager.subscribe({
    //   userVisibleOnly: true,
    //   applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY,
    // });
  
    // return subscription;

    console.log("SW :", SW);
    console.log("SERVICE WORKER REGISTERED");
    } catch (error) {
      console.error(error);
    }
  }

  export const subcribeTOSW = async() =>{
    const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY

    console.log("PUBLIC KEY :", import.meta.env.VITE_VAPID_PUBLIC_KEY);
    const registeredWorker = await navigator.serviceWorker.ready;

    let subscription = null;
    try {
      subscription = await registeredWorker.pushManager.subscribe({
        userVisibleOnly:true,
        applicationServerKey: publicVapidKey
      });
    } catch (error) {
      console.log(error)
    }
    if(!subscription)
      return toast.error("Error occured during the creation of a subscription")
    console.log("subscription :",subscription);

    return subscription;
  }

  export const sendSubscriptionToServer =  async(subscription, notificationDateTime, taskData, currentUserId) => {
    console.log("Sending subscription:", { subscription, notificationDateTime });
  
    try {
      // Check if subscription has the expected structure
      if (!subscription || typeof subscription.getKey !== 'function') {
        throw new Error("Invalid subscription object");
      }
      
      // Extract keys properly using the getKey method
      const p256dh = subscription.getKey ? 
        btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')))) : '';
      const auth = subscription.getKey ? 
        btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth')))) : '';
      
      const response = await axiosInstance.post(`/notification/subscribe/${currentUserId}`, {
        subscription: {
          endpoint: subscription.endpoint,
          keys: {
            p256dh,
            auth
          }
        },
        taskData,
        notificationDateTime
      });
      
      console.log("Push subscription sent successfully!", response.data);
      return response.data;
    } catch (error) {
      console.error("Error subscribing to push notifications", error);
      handleError(error);
      throw error; 
    }
  }

