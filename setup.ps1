Rename-Item -Path "d:\ltw2\frontend-Cilent" -NewName "frontend-Client" -ErrorAction SilentlyContinue

$baseDir = "d:\ltw2\frontend-Client\src"

$dirs = @(
    "assets\images", "assets\icons", "assets\banners",
    "components\Header", "components\Footer", "components\ProductCard", 
    "components\CategoryMenu", "components\Banner", "components\SearchBar", 
    "components\CartItem", "components\Pagination",
    "layouts",
    "pages\Home", "pages\Product", "pages\Category", "pages\Cart", "pages\Checkout", 
    "pages\Order", "pages\Auth", "pages\Profile", "pages\Contact", "pages\About", "pages\NotFound",
    "services", "hooks", "context", "routes", "utils"
)

foreach ($dir in $dirs) {
    New-Item -ItemType Directory -Force -Path "$baseDir\$dir" | Out-Null
}

$files = @{
    "components\Header\Header.jsx" = "import React from 'react';`n`nconst Header = () => { return <header>Header</header>; };`n`nexport default Header;"
    "components\Footer\Footer.jsx" = "import React from 'react';`n`nconst Footer = () => { return <footer>Footer</footer>; };`n`nexport default Footer;"
    "components\ProductCard\ProductCard.jsx" = "import React from 'react';`n`nconst ProductCard = () => { return <div>ProductCard</div>; };`n`nexport default ProductCard;"
    "components\CategoryMenu\CategoryMenu.jsx" = "import React from 'react';`n`nconst CategoryMenu = () => { return <div>CategoryMenu</div>; };`n`nexport default CategoryMenu;"
    "components\Banner\Banner.jsx" = "import React from 'react';`n`nconst Banner = () => { return <div>Banner</div>; };`n`nexport default Banner;"
    "components\SearchBar\SearchBar.jsx" = "import React from 'react';`n`nconst SearchBar = () => { return <div>SearchBar</div>; };`n`nexport default SearchBar;"
    "components\CartItem\CartItem.jsx" = "import React from 'react';`n`nconst CartItem = () => { return <div>CartItem</div>; };`n`nexport default CartItem;"
    "components\Pagination\Pagination.jsx" = "import React from 'react';`n`nconst Pagination = () => { return <div>Pagination</div>; };`n`nexport default Pagination;"
    
    "layouts\MainLayout.jsx" = "import React from 'react';`nimport { Outlet } from 'react-router-dom';`nimport Header from '../components/Header/Header';`nimport Footer from '../components/Footer/Footer';`n`nconst MainLayout = () => { return (<div><Header /><main><Outlet /></main><Footer /></div>); };`n`nexport default MainLayout;"
    "layouts\UserLayout.jsx" = "import React from 'react';`nimport { Outlet } from 'react-router-dom';`n`nconst UserLayout = () => { return (<div>UserLayout <Outlet /></div>); };`n`nexport default UserLayout;"
    
    "pages\Home\Home.jsx" = "import React from 'react';`n`nconst Home = () => { return <div>Home Page</div>; };`n`nexport default Home;"
    "pages\Product\ProductList.jsx" = "import React from 'react';`n`nconst ProductList = () => { return <div>ProductList Page</div>; };`n`nexport default ProductList;"
    "pages\Product\ProductDetail.jsx" = "import React from 'react';`n`nconst ProductDetail = () => { return <div>ProductDetail Page</div>; };`n`nexport default ProductDetail;"
    "pages\Category\CategoryPage.jsx" = "import React from 'react';`n`nconst CategoryPage = () => { return <div>CategoryPage</div>; };`n`nexport default CategoryPage;"
    "pages\Cart\Cart.jsx" = "import React from 'react';`n`nconst Cart = () => { return <div>Cart Page</div>; };`n`nexport default Cart;"
    "pages\Checkout\Checkout.jsx" = "import React from 'react';`n`nconst Checkout = () => { return <div>Checkout Page</div>; };`n`nexport default Checkout;"
    "pages\Order\OrderHistory.jsx" = "import React from 'react';`n`nconst OrderHistory = () => { return <div>OrderHistory Page</div>; };`n`nexport default OrderHistory;"
    "pages\Order\OrderDetail.jsx" = "import React from 'react';`n`nconst OrderDetail = () => { return <div>OrderDetail Page</div>; };`n`nexport default OrderDetail;"
    "pages\Auth\Login.jsx" = "import React from 'react';`n`nconst Login = () => { return <div>Login Page</div>; };`n`nexport default Login;"
    "pages\Auth\Register.jsx" = "import React from 'react';`n`nconst Register = () => { return <div>Register Page</div>; };`n`nexport default Register;"
    "pages\Auth\ForgotPassword.jsx" = "import React from 'react';`n`nconst ForgotPassword = () => { return <div>ForgotPassword Page</div>; };`n`nexport default ForgotPassword;"
    "pages\Profile\Profile.jsx" = "import React from 'react';`n`nconst Profile = () => { return <div>Profile Page</div>; };`n`nexport default Profile;"
    "pages\Contact\Contact.jsx" = "import React from 'react';`n`nconst Contact = () => { return <div>Contact Page</div>; };`n`nexport default Contact;"
    "pages\About\About.jsx" = "import React from 'react';`n`nconst About = () => { return <div>About Page</div>; };`n`nexport default About;"
    "pages\NotFound\NotFound.jsx" = "import React from 'react';`n`nconst NotFound = () => { return <div>404 NotFound</div>; };`n`nexport default NotFound;"
    
    "services\api.js" = "import axios from 'axios';`n`nconst api = axios.create({ baseURL: 'http://localhost:8080/api' });`n`nexport default api;"
    "services\productService.js" = "import api from './api';`n`nexport default { getAll: () => api.get('/products') };"
    "services\categoryService.js" = "import api from './api';`n`nexport default { getAll: () => api.get('/categories') };"
    "services\cartService.js" = "import api from './api';`n`nexport default {};"
    "services\orderService.js" = "import api from './api';`n`nexport default {};"
    "services\authService.js" = "import api from './api';`n`nexport default {};"
    
    "hooks\useCart.js" = "export const useCart = () => {};"
    
    "context\AuthContext.jsx" = "import React, { createContext } from 'react';`n`nexport const AuthContext = createContext();`n`nexport const AuthProvider = ({ children }) => { return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>; };"
    "context\CartContext.jsx" = "import React, { createContext } from 'react';`n`nexport const CartContext = createContext();`n`nexport const CartProvider = ({ children }) => { return <CartContext.Provider value={{}}>{children}</CartContext.Provider>; };"
    
    "routes\AppRoutes.jsx" = "import React from 'react';`nimport { Routes, Route } from 'react-router-dom';`nimport MainLayout from '../layouts/MainLayout';`nimport Home from '../pages/Home/Home';`nimport NotFound from '../pages/NotFound/NotFound';`n`nconst AppRoutes = () => { return (<Routes><Route path='/' element={<MainLayout />}><Route index element={<Home />} /><Route path='*' element={<NotFound />} /></Route></Routes>); };`n`nexport default AppRoutes;"
    
    "utils\formatPrice.js" = "export const formatPrice = (price) => price;"
    "utils\helpers.js" = "export const helper = () => {};"
}

foreach ($key in $files.Keys) {
    $path = "$baseDir\$key"
    if (-not (Test-Path $path)) {
        Set-Content -Path $path -Value $files[$key] -Encoding UTF8
    }
}
