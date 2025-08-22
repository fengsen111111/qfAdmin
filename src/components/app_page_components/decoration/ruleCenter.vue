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
	// console.log('当前路径:', route.query.title);
	const title = ref('')
	title.value = route.query.title


	const menuList = ref([])
	const fwbContent = ref('')

	if (title.value == '常见问题') {
		getQandAList()
	} else if (title.value == '学习中心') {
		getStudyList()
	} else if (title.value == '规则中心') {
		getRulesList()
	}
	// 常见问题
	function getQandAList() {
		global.axios
			.post('decoration/QandA/getQandAList', {}, global)
			.then((res) => {
				// console.log('常见问题', res.list);
				menuList.value = res.list
				state.selectedKeys = [res.list[0].id]
				getQandADetail()
			});
	}
	// 常见问题详情
	function getQandADetail() {
		global.axios
			.post('decoration/QandA/getQandADetail', {
				id: state.selectedKeys[0]
			}, global)
			.then((res) => {
				// console.log('常见问题答案', res);
				fwbContent.value = res.answer
			});
	}
	// 学习中心
	function getStudyList() {
		global.axios
			.post('decoration/Study/getStudyList', {
				type: 'store'
			}, global)
			.then((res) => {
				// console.log('学习中心', res.list);
				res.list.map((item) => {
					item.question = item.title
				})
				menuList.value = res.list
				state.selectedKeys = [res.list[0].id]
				getStudyDetail()
			});
	}
	// 学习中心详情
	function getStudyDetail() {
		global.axios
			.post('decoration/Study/getStudyDetail', {
				id: state.selectedKeys[0]
			}, global)
			.then((res) => {
				// console.log('学习中心答案', res);
				fwbContent.value = res.detail
			});
	}
	// 规则
	function getRulesList() {
		global.axios
			.post('decoration/Rules/getRulesList', {
				type: 'store'
			}, global).then((res) => {
				// console.log('规则', res.list);
				res.list.map((item, index) => {
					item.question = item.name
					getRulesVersionList(item.id, index)
				})
				menuList.value = res.list
				console.log('menuList', menuList.value);
			});
	}
	// 规则版本
	function getRulesVersionList(id, index) {
		global.axios
			.post('decoration/RulesVersion/getRulesVersionList', {
				rule_id: id
			}, global)
			.then((res) => {
				// console.log('版本列表',res.list);
				res.list.map((item, index) => {
					item.question = item.name
				})
				menuList.value[index].children = res.list
			});
	}
	// 规则详情
	function getRulesVersionDetail() {
		global.axios
			.post('decoration/RulesVersion/getRulesVersionDetail', {
				rule_version_id: state.selectedKeys[0]
			}, global)
			.then((resTwo) => {
				fwbContent.value = resTwo.content
			});
	}
	// 点击了某个标题
	function handleClick(item) {
		// console.log('点击了某个标题', item);
		state.selectedKeys = [item.id]
		if (title.value == '常见问题') {
			getQandADetail()
		} else if (title.value == '学习中心') {
			getStudyDetail()
		} else if (title.value == '规则中心') {
			getRulesVersionDetail()
		}
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
				<div @click="handUrl('/')" style="color: #fff;cursor: pointer;">
					返回首页
				</div>
			</div>
		</div>
		<div style="display: flex;background: #f5f5f5;height: 92vh;">
			<div style="padding: 20px;overflow: auto;height: 100%;width: 70vw;margin: 0 auto;">
				<!-- <div style="font-size: 18px;margin-bottom: 20px;">规则中心</div> -->
				<div style="display: flex;height: 87vh; width: 100%;">
					<a-menu v-if="title == '学习中心'" v-model:openKeys="state.openKeys" v-model:selectedKeys="state.selectedKeys"
						style="width: 256px" mode="vertical">
							<a-menu-item v-for="item in menuList" :key="item.id" @click="handleClick(item)">
								{{item.question}}
							</a-menu-item>
					</a-menu>
					<a-menu v-else v-model:openKeys="state.openKeys" v-model:selectedKeys="state.selectedKeys"
						style="width: 256px" mode="inline">
							<a-sub-menu v-for="item in menuList" :key="item.id">
								<template #title>{{item.question}}</template>
								<a-menu-item v-for="iss in item.children" :key="iss.id" @click="handleClick(iss)">
									{{iss.question}}
								</a-menu-item>
							</a-sub-menu>
					</a-menu>
					<div style="margin-left: 10px;background-color: #fff;border-radius: 4px;padding: 20px;width: 100%;">
						<div v-html="fwbContent"></div>
						<div v-if="!fwbContent" style="padding-top: 20vh;"><a-empty /></div>
					</div>
				</div>
			</div>
		</div>
	</div>
	<!--导出-->
</template>

<style lang="less" scoped>

</style>