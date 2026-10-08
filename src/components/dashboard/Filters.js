'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import styles from '@/app/dashboard/page.module.css';
import { Suspense } from 'react';

function FiltersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createQueryString = (name, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    return params.toString();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    router.push('?' + createQueryString(name, value), { scroll: false });
  };

  const clearFilters = () => {
    router.push('?', { scroll: false });
  };

  return (
    <div className={`card ${styles.filtersCard}`}>
      <div className="form-group mb-0" style={{ flex: '1 1 150px' }}>
        <label className="form-label text-xs">Stream</label>
        <select name="stream" value={searchParams.get('stream') || ''} onChange={handleChange} className="form-select">
          <option value="">All Streams</option>
          <option value="Digital">Digital</option>
          <option value="Ninja">Ninja</option>
          <option value="Prime">Prime</option>
        </select>
      </div>
      <div className="form-group mb-0" style={{ flex: '1 1 150px' }}>
        <label className="form-label text-xs">Location</label>
        <select name="location" value={searchParams.get('location') || ''} onChange={handleChange} className="form-select">
          <option value="">All Locations</option>
          <option value="Trivandrum">Trivandrum</option>
          <option value="Kochi">Kochi</option>
          <option value="Chennai">Chennai</option>
          <option value="Bangalore">Bangalore</option>
          <option value="Pune">Pune</option>
          <option value="Mumbai">Mumbai</option>
          <option value="Delhi">Delhi</option>
          <option value="Kolkata">Kolkata</option>
          <option value="Hyderabad">Hyderabad</option>
        </select>
      </div>
      <div className="form-group mb-0" style={{ flex: '1 1 150px' }}>
        <label className="form-label text-xs">JL Status</label>
        <select name="jlStatus" value={searchParams.get('jlStatus') || ''} onChange={handleChange} className="form-select">
          <option value="">All</option>
          <option value="Received">Received</option>
          <option value="Waiting">Waiting</option>
        </select>
      </div>
      <div className="form-group mb-0" style={{ flex: '1 1 150px' }}>
        <label className="form-label text-xs">IPA Status</label>
        <select name="ipaStatus" value={searchParams.get('ipaStatus') || ''} onChange={handleChange} className="form-select">
          <option value="">All</option>
          <option value="Given">Given</option>
          <option value="Not Given">Not Given</option>
          <option value="Pending">Pending</option>
        </select>
      </div>
      <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'flex-end' }}>
        <button 
          className="btn btn-outline" 
          onClick={clearFilters}
          style={{ height: '38px', marginTop: '1.75rem' }}
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}

export default function Filters() {
  return (
    <Suspense fallback={<div className={`card ${styles.filtersCard}`}>Loading filters...</div>}>
      <FiltersContent />
    </Suspense>
  );
}
