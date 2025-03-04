<script setup>
	import {
		ref,
		inject,
		reactive,
		onMounted,
		watch,
		getCurrentInstance
	} from 'vue'
	import { message } from 'ant-design-vue';
	const {
		proxy
	} = getCurrentInstance();
	const global = inject('global').value
	let props = defineProps(['structure'])
	console.log('props', props.structure.value);
	const bank_account_type = ref('74'); //账户类型
	const account_bank = ref(''); //开户银行
	const account_name = ref(''); //开户名称
	const bank_address_code = ref(''); //开户银行省市编码
	const bank_name = ref(''); //开户银行全称 （含支行）
	const account_number = ref(''); //银行账号

	watch(() => [bank_account_type.value, account_bank.value,account_name.value,bank_address_code.value,bank_name.value,account_number.value], (newVal, oldVal) => {
		console.log(newVal); //
		let params = {
			bank_account_type:newVal[0],//账户类型
			account_bank:newVal[1],//开户银行
			account_name:newVal[2],//开户名称
			bank_address_code:newVal[3][1], //开户银行省市编码
			bank_name:newVal[4],//开户银行全称 （含支行）
			account_number:newVal[5],//银行账号
		}
		options.value.map((item) => {
			if (item.account_bank_code == params.account_bank) {
				// 银行别名code
				params.account_bank = item.account_bank
			}
		})
		console.log('params',params);
		props.structure.value = JSON.stringify(params)
	});

	const options = ref([]) //开户行数据

	// 开户银行自定义字段
	const bankField = {
		label: 'account_bank',
		value: 'account_bank_code',
	}
	const city_code = ref('') //当前选中地区
	const bank_alias_code = ref('') //当前选中开户行

	const zhDataList = ref([]) //支行数据
	// 支行列表
	function zhList() {
		if(!city_code.value){
			message.error('请选择地区');
			return false
		}
		if(!bank_alias_code.value){
			message.error('请选择开户银行');
			return false
		}
		// 调用
		global.axios
			.post('beverage/WechatPay/getBanks', {
				type: '00',
				city_code: city_code.value + '',
				bank_alias_code: bank_alias_code.value + '',
				currentPage: '1',
				perPage: '200'
			}, global)
			.then((res) => {
				// console.log('支行列表', res.data);
				zhDataList.value = res.data
			});
	}
	// 开户银行选择数据
	function handleChange(e) {
		console.log('开户银行', e);
		options.value.map((item) => {
			if (item.account_bank_code == e) {
				// 银行别名code
				bank_alias_code.value = item.bank_alias_code
				zhList()
			}
		})
	};
	// 筛选
	function filterOption(inputValue, option) {
		// console.log(inputValue, option);
		return option.account_bank.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0;
	}

	function onChange(e) {
		if (e) {
			console.log('e', e.target.value);
		}
		// 调用
		global.axios
			.post('beverage/WechatPay/getBanks', {
				type: e ? e.target.value + '' : '74',
				currentPage: '1',
				perPage: '200'
			}, global)
			.then((res) => {
				// console.log('开户银行列表', res.data);
				options.value = res.data
			});
	}
	// 获取初始化数据
	onChange()
	const DistrictList = ref([]) //行政区
	const province_code = ref('') //市级编码
	// 行政区选择回调
	function changeDistrict(e) {
		console.log('开户银行省市编码', e);
		if (e.length == 1) {
			global.axios
				.post('beverage/WechatPay/getAreas', {
					type: '01',
					province_code: e[0]
				}, global)
				.then((res) => {
					// console.log('城市编码shi', res.data);
					DistrictList.value.map((item) => {
						if (item.province_code == e[0]) {
							item.children = res.data.map((iss) => {
								return {
									province_name: iss.city_name,
									province_code: iss.city_code,
									children: []
								}
							})
						}
					})
				});
		} else {
			city_code.value = e[1]
			zhList()
		}
	}
	// 自定义字段
	const fieldNames = {
		label: 'province_name',
		value: 'province_code',
		children: 'children',
	}
	// 城市编码
	function cityBase() {
		global.axios
			.post('beverage/WechatPay/getAreas', {
				type: '00',
				province_code: province_code.value
			}, global)
			.then((res) => {
				// console.log('城市编码', res.data);
				res.data.map((item) => {
					item.children = []
				})
				DistrictList.value = res.data
			});
	}
	cityBase()
	// 支行自定义字段
	const fieldZH = {
		label: 'bank_branch_name',
		value: 'bank_branch_name',
	}

	function zhChange(e) {
		console.log('支行选中', e);
		bank_name.value = e
	}
	// 筛选支行
	function filterOptionZh(inputValue, option) {
		return option.bank_branch_name.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0;
	}
</script>

<template>
	<div class="auto">
		<!-- <div>开户行信息</div><br> -->
		<label>账户类型</label><br>
		<a-radio-group v-model:value="bank_account_type" name="radioGroup" @change="onChange">
			<a-radio value="74">对公</a-radio>
			<a-radio value="75">对私账户</a-radio>
		</a-radio-group><br><br>
		<label>开户银行</label><br>
		<a-select :fieldNames="bankField" :filterOption="filterOption" v-model:value="account_bank" show-search
			placeholder="请选择" :options="options" @change="handleChange"></a-select><br><br>
		<label>开户名称</label><br>
		<a-input v-model:value="account_name" placeholder="请输入开户名称" ></a-input><br>
		<div style="color: red;margin-top: 10px;">
			1、选择经营者个人银行卡时，开户名称必须与身份证姓名一致。<br>
			2、选择对公账户时，开户名称必须与营业执照上的“商户名称”一致。<br>
		</div><br>
		<label>开户银行省市编码</label><br>
		<a-cascader :fieldNames="fieldNames" @change="changeDistrict" v-model:value="bank_address_code"
			:options="DistrictList" placeholder="请选择" />
		<br><br>
		<label>开户银行全称 （含支行）</label><br>
		<a-select :fieldNames="fieldZH" :filterOption="filterOptionZh" v-model:value="bank_name" show-search
			placeholder="请选择" :options="zhDataList" @change="zhChange"></a-select><br><br>
		<label>银行账号</label><br>
		<a-input v-model:value="account_number" placeholder="请输入银行账号"></a-input><br><br>
	</div>
</template>


<style>

</style>