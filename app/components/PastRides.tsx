'use client';

import { useEffect, useState } from 'react';
import { User } from '@/types';

type PastRidesProps = {
    user: User | null;
};

export default function PastRides({ user }: PastRidesProps) {
    const [rides, setRides] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);

    const fetchRides = async () => {
        if (!user?.token || !isOpen) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/rides`, {
                method: 'GET',
                headers: {
                    "Content-Type": process.env.NEXT_PUBLIC_CONTENT_TYPE!,
                    Accept: process.env.NEXT_PUBLIC_ACCEPT!,
                    Authorization: `Bearer ${user.token}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch ride history');
            }

            const data = await response.json();
            setRides(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setError(err.message || 'Could not load ride history');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchRides();
        }
    }, [isOpen, user]);

    return (
        <div className="mt-6">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-3 bg-gray-100 rounded-md hover:bg-gray-200 transition"
            >
                <span className="font-medium text-black-800">Past Rides ({rides.length})</span>
                <span className="text-xl">{isOpen ? '−' : '+'}</span>
            </button>

            {isOpen && (
                <div className="mt-2 bg-white border rounded-md shadow-sm overflow-hidden">
                    {loading && (
                        <p className="p-4 text-center text-black-600">Loading your ride history...</p>
                    )}

                    {error && (
                        <p className="p-4 text-red-600 text-sm">{error}</p>
                    )}

                    {!loading && !error && rides.length === 0 && (
                        <p className="p-4 text-black-500 text-sm">No past rides found.</p>
                    )}

                    {!loading && !error && rides.length > 0 && (
                        <ul className="divide-y divide-gray-200">
                            {rides.map((ride) => (
                                <li key={ride.id} className="p-4 hover:bg-gray-50">
                                    <div className="flex justify-between">
                                        <div>
                                            <p className="font-medium text-black-800">
                                                {ride.pickup_address || 'Unknown Pickup'}
                                            </p>
                                            <p className="text-sm text-black-600">
                                                → {ride.dropoff_address || 'Unknown Dropoff'}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-green-600">${ride.fare?.toFixed(2)}</p>
                                            <p className="text-xs text-black-500">
                                                {new Date(ride.created_at || ride.pickup_time).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}