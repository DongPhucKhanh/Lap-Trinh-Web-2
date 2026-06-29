import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const CategoryPage = () => { 
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      navigate(`/product?category=${id}`);
    } else {
      navigate('/product');
    }
  }, [id, navigate]);

  return <div style={{minHeight: '60vh', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>Đang chuyển hướng...</div>;
};

export default CategoryPage;
