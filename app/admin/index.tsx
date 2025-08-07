'use client';

import { useEffect, useState } from 'react';
import { User, Ride, Vehicle } from '@/types';

type DriverStatus = 'active' | 'inactive' | 'suspended';

type Driver = {
  id: number;
  user_id: number;
  license_number: string;
  status: DriverStatus;
  user: User | null;
  vehicle?: Vehicle;
};

type AdminPageProps = {
  user: User | null;
  setPage: (page: string) => void;
};

export default function AdminPage({ user, setPage }: AdminPageProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🔐 Protect: Only allow if user is admin
  useEffect(() => {
    if (!user) {
      setPage('login');
      return;
    }
    if (user.role !== 'admin') {
      alert('Access denied. Admins only.');
      setPage('home');
      return;
    }
    fetchAdminData();
  }, [user, setPage]);

  const fetchAdminData = async () => {
    setLoading(true);
    setError(null);

    if (!user || !user.id) {
      alert("Authentication error. Please log in again.");
      setPage("login");
      return;
    }

    try {
      const token = user.token;

      // Fetch Users
      const usersRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!usersRes.ok) throw new Error('Failed to fetch users');

      const usersResponseData = await usersRes.json();
      const usersData = Array.isArray(usersResponseData)
        ? usersResponseData
        : usersResponseData.data || [];

      if (!Array.isArray(usersData)) {
        throw new Error('Invalid users data format');
      }

      // Fetch Vehicles
      const vehiclesRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/vehicles`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!vehiclesRes.ok) throw new Error('Failed to fetch vehicles');

      const vehiclesResponseData = await vehiclesRes.json();
      const vehiclesData = Array.isArray(vehiclesResponseData)
        ? vehiclesResponseData
        : vehiclesResponseData.data || [];

      if (!Array.isArray(vehiclesData)) {
        throw new Error('Invalid vehicles data format');
      }

      // Process drivers
      const fetchedDrivers = usersData
        .filter(u => u.role === 'driver')
        .map((u): Driver => {
          const vehicle = vehiclesData.find(v => v.driver_id === u.id);
          return {
            id: u.id,
            user_id: u.id,
            license_number: 'N/A',
            status: (u.status === 'inactive' ? 'inactive' : 'active') as 'active' | 'inactive',
            user: u,
            vehicle,
          };
        });

      setUsers(usersData.filter(u => u.role !== 'driver'));
      setVehicles(vehiclesData);
      setDrivers(fetchedDrivers);
    } catch (err: any) {
      setError(err.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (driverId: number) => {
    if (!window.confirm('Activate this driver?')) return;
    await handleDriverAction(`activate`, driverId);
  };

  const handleDeactivate = async (driverId: number) => {
    if (!window.confirm('Deactivate this driver?')) return;
    await handleDriverAction(`deactivate`, driverId);
  };

  const handleSuspend = async (driverId: number) => {
    if (!window.confirm('Suspend this driver?')) return;
    await handleDriverAction(`suspend`, driverId);
  };

  const handleUnsuspend = async (driverId: number) => {
    if (!window.confirm('Unsuspend this driver?')) return;
    await handleDriverAction(`unsuspend`, driverId);
  };

  const handleDeleteUser = async (userId: number) => {
    if (!window.confirm('Delete this user permanently? This cannot be undone.')) return;

    if (!user || !user.id) {
      alert("Authentication error. Please log in again.");
      setPage("login");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          "Content-Type": process.env.NEXT_PUBLIC_CONTENT_TYPE!,
          Accept: process.env.NEXT_PUBLIC_ACCEPT!,
        },
      });

      if (!res.ok) throw new Error('Failed to delete user');

      setUsers(prev => prev.filter(u => u.id !== userId));
      setDrivers(prev => prev.filter(d => d.user_id !== userId));
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDriverAction = async (action: string, driverId: number) => {

    if (!user || !user.id) {
      alert("Authentication error. Please log in again.");
      setPage("login");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/drivers/${driverId}/${action}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          "Content-Type": process.env.NEXT_PUBLIC_CONTENT_TYPE!,
          Accept: process.env.NEXT_PUBLIC_ACCEPT!,
        },
      });

      if (!res.ok) throw new Error(`Failed to ${action} driver`);

      // Update local state
      setDrivers(prev =>
        prev.map(d =>
          d.id === driverId
            ? {
              ...d,
              status:
                action === 'activate'
                  ? 'active'
                  : action === 'deactivate'
                    ? 'inactive'
                    : action === 'suspend'
                      ? 'suspended'
                      : 'active',
            }
            : d
        )
      );

      alert(`Driver ${action}d successfully.`);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-16">
        <p className="text-lg text-gray-600">Loading admin dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchAdminData}
          className="mt-4 text-blue-600 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto mt-12 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Admin Dashboard</h1>

      {error && <p className="p-4 mb-6 bg-red-100 text-red-700 rounded">{error}</p>}

      {/* Users Table */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Users</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border-b">ID</th>
                <th className="py-2 px-4 border-b">Name</th>
                <th className="py-2 px-4 border-b">Email</th>
                <th className="py-2 px-4 border-b">Role</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-500">
                    No non-driver users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{user.id}</td>
                    <td className="py-2 px-4 border-b">{user.name}</td>
                    <td className="py-2 px-4 border-b">{user.email}</td>
                    <td className="py-2 px-4 border-b">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {user.role}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b">
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Drivers Table */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Drivers</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border-b">ID</th>
                <th className="py-2 px-4 border-b">Name</th>
                <th className="py-2 px-4 border-b">Email</th>
                <th className="py-2 px-4 border-b">Status</th>
                <th className="py-2 px-4 border-b">Vehicle</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {drivers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-gray-500">
                    No drivers found.
                  </td>
                </tr>
              ) : (
                drivers.map((driver) => (
                  <tr key={driver.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{driver.id}</td>
                    <td className="py-2 px-4 border-b">{driver.user?.name || 'Unknown'}</td>
                    <td className="py-2 px-4 border-b">{driver.user?.email || 'N/A'}</td>
                    <td className="py-2 px-4 border-b">
                      <span
                        className={`px-2 py-1 text-xs rounded ${driver.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : driver.status === 'suspended'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                          }`}
                      >
                        {driver.status}
                      </span>
                    </td>
                    <td className="py-2 px-4 border-b">
                      {driver.vehicle ? (
                        <div>
                          <div>{driver.vehicle.make} {driver.vehicle.model}</div>
                          <div className="text-gray-500 text-xs">{driver.vehicle.plate_number}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">No vehicle</span>
                      )}
                    </td>
                    <td className="py-2 px-4 border-b space-y-1">
                      {driver.status !== 'active' && (
                        <button
                          onClick={() => handleActivate(driver.id)}
                          className="block w-full text-left text-green-600 hover:underline text-sm"
                        >
                          Activate
                        </button>
                      )}
                      {driver.status !== 'inactive' && (
                        <button
                          onClick={() => handleDeactivate(driver.id)}
                          className="block w-full text-left text-orange-600 hover:underline text-sm"
                        >
                          Deactivate
                        </button>
                      )}
                      {driver.status !== 'suspended' ? (
                        <button
                          onClick={() => handleSuspend(driver.id)}
                          className="block w-full text-left text-red-600 hover:underline text-sm"
                        >
                          Suspend
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUnsuspend(driver.id)}
                          className="block w-full text-left text-blue-600 hover:underline text-sm"
                        >
                          Unsuspend
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Vehicles Table */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Vehicles</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg shadow">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border-b">ID</th>
                <th className="py-2 px-4 border-b">Make</th>
                <th className="py-2 px-4 border-b">Model</th>
                <th className="py-2 px-4 border-b">Plate Number</th>
                <th className="py-2 px-4 border-b">Driver ID</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-gray-500">
                    No vehicles found.
                  </td>
                </tr>
              ) : (
                vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b">{v.id}</td>
                    <td className="py-2 px-4 border-b">{v.make}</td>
                    <td className="py-2 px-4 border-b">{v.model}</td>
                    <td className="py-2 px-4 border-b">{v.plate_number}</td>
                    <td className="py-2 px-4 border-b">
                      {v.driver_id ? (
                        <a
                          href="#"
                          className="text-blue-600 hover:underline"
                          onClick={(e) => {
                            e.preventDefault();
                            const el = document.getElementById(`driver-${v.driver_id}`);
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }}
                        >
                          {v.driver_id}
                        </a>
                      ) : (
                        <span className="text-gray-400">Unassigned</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}