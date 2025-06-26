import React, { useContext } from 'react';
import { DoctorContext } from '../../context/DoctorContext';

const Inquiries = () => {
  const { inquiries, loading } = useContext(DoctorContext);

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-screen w-full">
        <p className="text-lg text-gray-600">Loading inquiries...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen w-full">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Inquiries</h1>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        {inquiries && inquiries.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Message</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {inquiries.map((inquiry) => (
                  <tr key={inquiry.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{inquiry.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{inquiry.email}</td>
                    <td className="px-6 py-4">{inquiry.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p>No inquiries found.</p>
        )}
      </div>
    </div>
  );
};

export default Inquiries; 