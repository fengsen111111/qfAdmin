import {createRouter, createWebHistory} from "vue-router";

const routes = [
    {
        path: '/login',
        name: 'LoginPage',//登陆
        component: () => import(/* @vite-ignore */'../components/base_page_components/login.vue')
    },
    {
        path: '/',
        name: 'SkeletonPage',//通用页面
        props: true,
        component: () => import(/* @vite-ignore */'../components/base_page_components/skeleton.vue')
    },
    {
        path: '/openShop',
        name: 'openShop',//0元开店
        props: true,
        component: () => import(/* @vite-ignore */'../components/app_page_components/decoration/openShop.vue')
    },
];

export const router = createRouter({
    history: createWebHistory(),
    routes,
});
router.beforeEach((to, from, next) => {
    if (to.path === '/') {
        next();
    } else {
        let token = localStorage.getItem('token');
        if(to.path == '/openShop'){//0元开店不阻止跳转
            next();
        }else if (token === 'null' || token === '') {
            next('/');
        } else {
            next();
        }
    }
})
