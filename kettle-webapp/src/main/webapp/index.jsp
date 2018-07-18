<%@ page language="java" contentType="text/html; charset=utf-8" pageEncoding="utf-8"%>
<!DOCTYPE html>
<html>
	<head>
	  	<title>KettleConsole</title>
	  	<link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/ext3/resources/css/ext-all.css" />
	  	<link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/ui/css/public.css" />
		<link rel='shortcut icon' href='${pageContext.request.contextPath}/img/f1_logo_small.ico' type=‘image/x-ico’ />
	</head>
	<body>

		<div id="loading-mask">
			<input type="hidden" id="context-path" value="${pageContext.request.contextPath}" />
			<script type="text/javascript" src="${pageContext.request.contextPath}/js/other/init.js"></script>
		</div>
		<div id="loading">
		    <div class="loading-indicator">
		        <img src="ui/resources/extanim32.gif" width="32" height="32" style="margin-right:8px;" align="absmiddle" />
				系统加载中，请稍后...
		    </div>
		</div>

		<input type="hidden" id="loginUsername"  value="${sessionScope.login.login}"/>
		<input type="hidden" id="userTypeHidden" value="${sessionScope.userInfo.userType}" />
		<input type="hidden" id="slavePowerHidden" value="${sessionScope.userInfo.slavePremissonType}" />
		<input type="hidden" id="taskGroupPowerHidden" value="${sessionScope.userInfo.taskPremissionType}" />
		<input type="hidden" id="belongToUserGroup" value="${sessionScope.userInfo.userGroupName}" />
		
		<!-- javascript脚本编辑器框架加载 -->
		<link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/CodeMirror/codemirror.css" />
	    <script type="text/javascript" src="${pageContext.request.contextPath}/CodeMirror/codemirror.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/CodeMirror/javascript.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/CodeMirror/sql.js"></script>
	    
	    
	    <link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/ext3/ux/ext-patch.css" />
	    <link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/ext3/ux/treegrid/treegrid.css" />
	    <link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/ui/css/system.css2" />
	    <script type="text/javascript" src="${pageContext.request.contextPath}/mxgraph2/js/mxClient3.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/ext3/adapter/ext/ext-base.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/ext3/ext-all-debug.js"></script>
	    
	    <script type="text/javascript" src="${pageContext.request.contextPath}/ext3/ux/CheckColumn.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/ext3/ux/ListBox.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/ext3/ux/ConditionEditor.js"></script>
	    
	    <link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/ext3/ux/fileupload/css/fileuploadfield.css" />
	    <script type="text/javascript" src="${pageContext.request.contextPath}/ext3/ux/fileupload/FileUploadField.js"></script>
	    
	    <script type="text/javascript" src="${pageContext.request.contextPath}/ext3/ux/DynamicEditorGrid.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/ext3/ux/treegrid/TreeGridNodeUI.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/ext3/ux/treegrid/TreeGrid.js"></script>
	    
	    <link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/ext3/ux/datetime/Spinner.css" />
	    <link rel="stylesheet" type="text/css" href="${pageContext.request.contextPath}/ext3/ux/datetime/datetime.css" />
	    <script type="text/javascript" src="${pageContext.request.contextPath}/ext3/ux/datetime/Spinner.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/ext3/ux/datetime/SpinnerField.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/ext3/ux/datetime/datetime.js"></script>
	    
	    <script type="text/javascript" src="${pageContext.request.contextPath}/ui/global.js2"></script>

	    <!-- Kettle核心面板组件 -->
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/graph/KettleDialog.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/graph/BaseGraph.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/graph/TransGraph.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/graph/JobGraph.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/graph/TransResult.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/graph/JobResult.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/graph/SlaveServerDialog.js"></script>
	    
	    <!-- 与转换相关的对话框 -->
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/trans/TransLogTransPanel.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/trans/TransLogStepPanel.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/trans/TransLogRunningPanel.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/trans/TransLogChannelPanel.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/trans/TransLogMetricsPanel.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/trans/TransTab.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/trans/TransParamTab.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/trans/TransLogTab.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/trans/TransDateTab.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/trans/TransDependenciesTab.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/trans/TransMiscTab.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/trans/TransMonitoringTab.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/trans/TransDialog.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/trans/TransExecutionConfigurationDialog.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/trans/ClusterSchemaDialog.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/trans/PartitionSchemaDialog.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/trans/StepErrorMetaDialog.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/trans/TransDebugDialog.js"></script>
	    
	    <!-- 与任务相关的对话框 -->
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/job/JobExecutionConfigurationDialog.js"></script>
	    
	    <!-- 与数据库相关的对话框 -->
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/database/NormalPanel.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/database/AdvancePanel.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/database/OptionsPanel.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/database/PoolPanel.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/database/ClusterPanel.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/database/DatabaseDialog.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/database/DatabaseExplorerDialog.js"></script>
	    
	    <!-- 与资源库相关的对话框 -->
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/repository/KettleDatabaseRepositoryDialog.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/repository/KettleFileRepositoryDialog.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/repository/RepositoriesDialog.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/repository/RepositoryCheckTree.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/repository/RepositoryTree.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/repository/RepositoryManageDialog.js"></script>
	    
	    <!-- 与调度相关的对话框 -->
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/scheduler/SchedulerDialog.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/scheduler/SchedulerLogDialog.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/scheduler/SchedulerManageDialog.js"></script>
	    
	    <!-- 系统对话框 -->
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/StepFieldsDialog.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/SQLStatementsDialog.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/CheckResultDialog.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/EnterTextDialog.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/EnterSelectionDialog.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/dialogs/EnterValueDialog.js"></script>
	    
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/other/TextAreaDialog.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/other/AnswerDialog.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/other/FileExplorerWindow.js"></script>
		<script type="text/javascript" src="${pageContext.request.contextPath}/ECharts/echarts.js"></script>
	    <!-- 系统入口对话框 -->
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/GuidePanel.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/initMain.js"></script>
	    <script type="text/javascript" src="${pageContext.request.contextPath}/js/initStore.js"></script>
		<script type="text/javascript" src="${pageContext.request.contextPath}/js/task/user.js"></script>
		<script type="text/javascript" src="${pageContext.request.contextPath}/js/task/userGroup.js"></script>
		<script type="text/javascript" src="${pageContext.request.contextPath}/js/task/jobMonitor.js"></script>
		<script type="text/javascript" src="${pageContext.request.contextPath}/js/task/transMonitor.js"></script>
		<script type="text/javascript" src="${pageContext.request.contextPath}/js/task/slave.js"></script>
		<script type="text/javascript" src="${pageContext.request.contextPath}/js/task/fixedtimeExecute.js"></script>
		<script type="text/javascript" src="${pageContext.request.contextPath}/js/task/JobScheduler.js"></script>
		<script type="text/javascript" src="${pageContext.request.contextPath}/js/task/taskControl.js"></script>
		<script type="text/javascript" src="${pageContext.request.contextPath}/js/task/slaveMonitor.js"></script>
		<script type="text/javascript" src="${pageContext.request.contextPath}/js/task/taskGroupMonitor.js"></script>
		<script type="text/javascript" src="${pageContext.request.contextPath}/js/task/taskHistoryLogs.js"></script>
		<script type="text/javascript" src="${pageContext.request.contextPath}/js/task/moduleView.js"></script>
		<script type="text/javascript" src="${pageContext.request.contextPath}/js/task/hadoopCluster.js"></script>
	</body>
</html>