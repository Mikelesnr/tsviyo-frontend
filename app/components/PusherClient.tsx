'use client';

import { useEffect } from 'react';

declare global {
    interface Window {
        Pusher?: any;
    }
}

export default function PusherClient() {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const script = document.createElement('script');
        script.src = 'https://js.pusher.com/8.3.0/pusher.min.js';
        script.async = true;

        script.onload = () => {
            // Initialize Pusher with public key
            const pusher = new (window as any).Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY, {
                cluster: 'us3',
            });

            const channel = pusher.subscribe('ride-updates');

            channel.bind('ride.requested', function (data: any) {
                console.log('Ride requested:', data);

                // Show alert with ride details
                if (data.ride) {
                    alert(
                        `New Ride Request!\n\n` +
                        `From: ${data.ride.pickup_address || 'Unknown'}\n` +
                        `To: ${data.ride.dropoff_address || 'Unknown'}\n` +
                        `Fare: $${data.ride.fare?.toFixed(2) || 'N/A'}`
                    );
                }
            });

            // Cleanup on unmount
            return () => {
                channel.unbind_all();
                channel.unsubscribe();
                pusher.disconnect();
            };
        };

        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
        };
    }, []);

    return null;
}