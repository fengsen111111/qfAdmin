<script setup>
	import { inject, onBeforeMount, reactive, ref, watch, shallowRef } from "vue";
	import { Row, Col } from 'ant-design-vue';
	import { InfoCircleOutlined, CheckCircleOutlined, PlusOutlined, CloseCircleOutlined } from "@ant-design/icons-vue";

	let props = defineProps(["pageData"]);
	const pageData = props.pageData;
	let emit = defineEmits(["openChildPage", "closeChildPage"]);
	const global = inject("global").value;


	const state = reactive({
		selectedKeys: [],
		openKeys: [],
	});

	// 跳转其它路由
	function handUrl(url) {
		global.router.push(url)
	}

	import { useRoute } from 'vue-router';
	const route = useRoute();
	console.log('当前路径:', route.query.title);
	const title = ref('')
	title.value = route.query.title


    // 点击了某个标题
	function handleClick(){
		console.log('点击了某个标题');
	}
</script>

<template>
	<!--搜索-->
	<div>
		<div style="background-color: #323242;height: 8vh;display: flex;">
			<div
				style="padding: 20px;height: 100%;width: 70vw;margin: 0 auto;display: flex;justify-content: space-between;align-items: center;">
				<div style="display: flex;">
					<img :src="global.adminLogo" alt="" style="width: auto;height: 45px;border-radius: 5px">
					<span style="font-size: 28px;margin-left: 5px;color: #fff;font-weight: bold;">{{title}}
					</span>
				</div>
				<div @click="handUrl('/')" style="color: #fff;">
					返回首页
				</div>
			</div>
		</div>
		<div style="display: flex;background: #f5f5f5;height: 92vh;">
			<div style="padding: 20px;overflow: auto;height: 100%;width: 70vw;margin: 0 auto;">
				<!-- <div style="font-size: 18px;margin-bottom: 20px;">规则中心</div> -->
				<div style="display: flex;height: 87vh; width: 100%;">
					<a-menu v-model:openKeys="state.openKeys" v-model:selectedKeys="state.selectedKeys"
						style="width: 256px" mode="vertical" @click="handleClick">
						<a-menu-item key="1">
							某某规则1
						</a-menu-item>
						<a-menu-item key="2">
							某某规则2
						</a-menu-item>
					</a-menu>
					<div style="margin-left: 10px;background-color: #fff;border-radius: 4px;padding: 20px;width: 100%;">
						富文本内容
					</div>
				</div>
			</div>
		</div>
	</div>
	<!--导出-->
</template>

<style lang="less" scoped>

</style>