import React from 'react';

export default function Placeholder({ name }: { name: string }) {
  return (
    <div className="bg-white p-12 rounded-[32px] border border-dashed border-gray-200 text-center">
      <h3 className="text-2xl font-black text-gray-800 mb-2">{name}</h3>
      <p className="text-gray-400">Halaman ini sedang dalam pengembangan.</p>
    </div>
  );
}
