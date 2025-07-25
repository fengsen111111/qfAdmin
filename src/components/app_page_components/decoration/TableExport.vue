<script setup>
	import { ref, defineExpose } from 'vue'
	import * as XLSX from 'xlsx-js-style'
	import { saveAs } from 'file-saver'

	const tableRef = ref()

	function exportExcel() {
		const tableEl = tableRef.value
		if (!tableEl) return

		const workbook = XLSX.utils.table_to_book(tableEl, { sheet: 'Sheet1' })
		const worksheet = workbook.Sheets['Sheet1']
		const range = XLSX.utils.decode_range(worksheet['!ref'])

		const totalCols = range.e.c - range.s.c + 1
		const last4StartIndex = totalCols - 4

		// 遍历所有单元格，设置样式
		for (let R = range.s.r; R <= range.e.r; ++R) {
			for (let C = range.s.c; C <= range.e.c; ++C) {
				const cellRef = XLSX.utils.encode_cell({ r: R, c: C })
				const cell = worksheet[cellRef]
				if (cell) {
					cell.s = {
						alignment: {
							wrapText: true,
							vertical: 'center',
							horizontal: 'left'
						}
					}
					if (
						typeof cell.v === 'string' &&
						(cell.v.includes('商家数据需求') || cell.v.includes('推荐官数据需求'))
					) {
						cell.s.alignment.horizontal = 'center'
					}
				}
			}
		}

		// 设置列宽
		const colWidths = []
		for (let C = 0; C < totalCols; C++) {
			if (C === 0) {
				colWidths.push({ wch: 8 }) // 第一列窄
			} else if (C >= last4StartIndex) {
				// 最后四列自适应
				let maxLen = 10
				for (let R = range.s.r; R <= range.e.r; ++R) {
					const cell = worksheet[XLSX.utils.encode_cell({ r: R, c: C })]
					if (cell && cell.v) {
						const len = String(cell.v).length
						if (len > maxLen) maxLen = len
					}
				}
				colWidths.push({ wch: maxLen + 2 }) // 适当留点空隙
			} else {
				colWidths.push({ wch: 42 }) // 中间列固定宽度
			}
		}
		worksheet['!cols'] = colWidths

		// 导出 Excel
		const excelBuffer = XLSX.write(workbook, {
			bookType: 'xlsx',
			type: 'array',
			cellStyles: true
		})
		const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
		saveAs(blob, `商家导出数据_${new Date().toLocaleDateString()}.xlsx`)
	}

	defineExpose({ exportExcel })
</script>
<template>
	<!--表格-->
	<div v-show="false" ref="tableRef">
		<table border="1" cellspacing="0" cellpadding="8"
			style="border-collapse: collapse; width: 100%; font-size: 14px; text-align: left;">
			<tbody>
				<tr>
					<td colspan="6" style="text-align: center; vertical-align: middle;">
						商家数据需求
					</td>
					<td></td>
					<td></td>
					<td></td>
				</tr>
				<tr>
					<td>1</td>
					<td>企业名称</td>
					<td></td>
					<td colspan="2" rowspan="15">
						<center>商家</center>
					</td>
					<td colspan="4" rowspan="19">
						<center>商家后台需要对账中心，可以导出超管后台可以查询、导出商家账单(特定和全部商家)</center>
					</td>
				</tr>
				<tr>
					<td>2</td>
					<td>统一社会信用代码</td>
					<td></td>
				</tr>
				<tr>
					<td>3</td>
					<td>姓名</td>
					<td>（法人）</td>
				</tr>
				<tr>
					<td>4</td>
					<td>证件类型</td>
					<td>（默认法人身份证）</td>
				</tr>
				<tr>
					<td>5</td>
					<td>证件号码</td>
					<td>（默认法人身份证）</td>
				</tr>
				<tr>
					<td>6</td>
					<td>国家或地区</td>
					<td>默认：中国</td>
				</tr>
				<tr>
					<td>7</td>
					<td>收入来源的互联网平台名称</td>
					<td>默认：圈风</td>
				</tr>
				<tr>
					<td>8</td>
					<td>开店时间</td>
					<td>注册时间</td>
				</tr>
				<tr>
					<td>9</td>
					<td>退店时间</td>
					<td>退店流程结束</td>
				</tr>
				<tr>
					<td>10</td>
					<td>收入来源的店铺（用户）名称</td>
					<td>圈风店铺名称</td>
				</tr>
				<tr>
					<td>11</td>
					<td>收入来源的店铺（用户）唯一标识码</td>
					<td>圈风店铺ID,编号</td>
				</tr>
				<tr>
					<td>12</td>
					<td>销售货物取得的收入</td>
					<td></td>
				</tr>
				<tr>
					<td>12.1</td>
					<td>1、日、月收入总额；2、季度收入总额（1-3；4-6；7-9；10-12）；3、年度收入总额</td>
					<td>时间节点：用户下单并支付成功</td>
				</tr>
				<tr>
					<td>12.2</td>
					<td>1、日、月退款总额；2、季度退款总额（1-3；4-6；7-9；10-12）；3、年度退款总额</td>
					<td>时间节点：全部退款（包括未发货订单、运输途中退款、退货退款订单）不包括售后中的订单</td>
				</tr>
				<tr>
					<td>12.3</td>
					<td>1、日、月收入净额；2、季度收入净额（1-3；4-6；7-9；10-12）；3、年度收入净额</td>
					<td>12.3 = 12.1 - 12.2</td>
				</tr>
				<tr>
					<td>13</td>
					<td>销售无形资产取得的收入</td>
					<td>同10</td>
					<td colspan="2">二级分类区别(虚拟商品-虚拟商品/服务)</td>
				</tr>
				<tr>
					<td>14</td>
					<td>销售服务取得的收入</td>
					<td>同1</td>
					<td colspan="2">二级分类区别(虚拟商品-本地生活服务)</td>
				</tr>
				<tr>
					<td>15</td>
					<td> 支付给平台的佣金、服务费合计金额</td>
					<td>12.3*平台技术服务费2%+支付给推荐官的佣金</td>
				</tr>
				<tr>
					<td>16</td>
					<td>交易(订单)数量(笔)</td>
					<td>日、月、季度、年度</td>
				</tr>
				<tr>
					<td></td>
					<td></td>
					<td></td>
					<td></td>
					<td></td>
					<td></td>
					<td></td>
					<td></td>
					<td></td>
				</tr>
				<tr>
					<td></td>
					<td></td>
					<td></td>
					<td></td>
					<td></td>
					<td></td>
					<td></td>
					<td></td>
					<td></td>
				</tr>
				<tr>
					<td></td>
					<td></td>
					<td></td>
					<td></td>
					<td></td>
					<td></td>
					<td></td>
					<td></td>
					<td></td>
				</tr>
				<tr>
					<td></td>
					<td></td>
					<td></td>
					<td></td>
					<td></td>
					<td></td>
					<td></td>
					<td></td>
					<td></td>
				</tr>
				<tr>
					<td colspan="6" style="text-align: center; vertical-align: middle;">
						推荐官数据需求
					</td>
					<td></td>
					<td></td>
					<td></td>
				</tr>
				<tr>
					<td>1</td>
					<td>姓名</td>
					<td></td>
					<td></td>
					<td colspan="1" rowspan="15">
						<center>推荐官</center>
					</td>
					<td colspan="4" rowspan="15">
						<center>超管后台可以查询、导出商家账单(特定和全部推荐官)</center>
					</td>
				</tr>
				<tr>
					<td>2</td>
					<td>证件类型</td>
					<td>(默认身份证)</td>
					<td></td>
				</tr>
				<tr>
					<td>3</td>
					<td>证件号码</td>
					<td>(默认身份证)</td>
					<td></td>
				</tr>
				<tr>
					<td>4</td>
					<td>国家或地区</td>
					<td>默认:中国)</td>
					<td></td>
				</tr>
				<tr>
					<td>5</td>
					<td>收入来源的互联网平台名称</td>
					<td>默认:圈风</td>
					<td></td>
				</tr>
				<tr>
					<td>6</td>
					<td>收入来源的(用户)名称</td>
					<td>圈风昵称</td>
					<td></td>
				</tr>
				<tr>
					<td>7</td>
					<td>收入来源的(用户)唯一标识码</td>
					<td>圈风号，编号</td>
					<td></td>
				</tr>
				<tr>
					<td>8</td>
					<td>注册日期</td>
					<td>推荐官认证之日</td>
					<td></td>
				</tr>
				<tr>
					<td>9</td>
					<td>注销之日</td>
					<td>推荐官注销流程结束之日</td>
					<td></td>
				</tr>
				<tr>
					<td>10</td>
					<td>收入净额</td>
					<td>带货收入</td>
					<td></td>
				</tr>
				<tr>
					<td>10.1</td>
					<td>1、日、月收入总额;2、季度收入总额(1-3:4-6:7-9:10-12)3、年度收入总额</td>
					<td>时间节点:用户下单并成功支付;</td>
					<td></td>
				</tr>
				<tr>
					<td>10.2</td>
					<td>1、日、月退款总额;2、季度退款总额(1-3:4-6:7-9;10-12);3、年度退款总额</td>
					<td>时间节点:全部退款(包括未发货取消订单、运输途中退款、退货退款订单)不包括售后中的订单</td>
					<td></td>
				</tr>
				<tr>
					<td>10.3</td>
					<td>1、日、月收入净额;2、季度收入净额(1-3:4-6:7-9:10-12);3、年度收入净额</td>
					<td>10.3=10.1-10.2</td>
					<td></td>
				</tr>
				<tr>
					<td>11</td>
					<td>支付给平台的服务费合计金额</td>
					<td>10.3*平台技术服务费20%</td>
					<td></td>
				</tr>
				<tr>
					<td>12</td>
					<td>交易(订单)数量(笔)</td>
					<td>日、月、季度、年度</td>
					<td></td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<style lang="less" scoped></style>