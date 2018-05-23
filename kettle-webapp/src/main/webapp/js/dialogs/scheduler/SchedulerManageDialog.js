SchedulerManageDialog = Ext.extend(Ext.Window, {
	title: '任务管理',
	width: 800,
	height: 400,
	layout: 'fit',
	modal: true,
	initComponent: function() {
		
		var reader = new Ext.data.JsonReader( {
			fields : [ 'name', 'group', 'lastestStatus', 'previousFireTime','nextFireTime', 'triggerState', 'caozuo' ]
		});

		var store = new Ext.data.GroupingStore( {
			reader : reader,
			groupField : 'group',
			url : GetUrl('schedule/jobs.do')
		});
		
		var renderCaozuo = function(v, m, record) {
			var str = '<a href="javascript:;">执行日志</a>';
			return str;
		};
		
		var renderStatus = function(v, m, record) {
			if(v == 'NORMAL')
				return '待执行';
			else if(v == 'BLOCKED')
				return '执行中';
			else if(v == 'PAUSED')
				return '已暂停';
			return v;
		};
		
		var grid = this.items = new Ext.grid.GridPanel({
			border: false,
			store : store,
			view : new Ext.grid.GroupingView({
				forceFit : true,
				groupTextTpl : '{text} ({[values.rs.length]} 个任务)'
			}),
			columns : [ 
	           {header : '任务名', dataIndex : 'name', width : 200}, 
	           {header : '上次执行状态', dataIndex : 'lastestStatus', width : 140}, 
	           {header : '上次执行时间', dataIndex : 'previousFireTime', width : 200}, 
	           {header : '', dataIndex : 'group', width : 140, hidden : true}, 
	           {header : '下次执行时间', dataIndex : 'nextFireTime', width : 200}, 
	           {header : '状态', dataIndex : 'triggerState', width : 120, renderer: renderStatus},
	           {header : '', dataIndex : 'caozuo', width : 120, renderer : renderCaozuo}
	           ],
				tbar : [{
					text : '暂停任务', scope: this, handler : this.pause
				}, '-', {
					text : '恢复任务', scope: this, handler : this.resume
				}, '-', {
					text : '终止执行', handler : function() {
					}
				}, '-', {
					text : '移除任务', scope: this, handler : this.remove
				}, '-', {
					text : '执行任务', scope: this, handler : this.execute
				}]
			});
		
		grid.on('cellclick', function(grid, rowIndex, columnIndex, e) {
			if (e.getTarget().innerHTML === '执行日志' ) { 
				var record = grid.getStore().getAt(rowIndex);
				this.showExecutionTrace(record.get('name'));
			}
		}, this);
		
		var sm = grid.getSelectionModel(), selectedRows = [];
		store.on('beforeload', function() {
			selectedRows.length = 0;
			Ext.each(sm.getSelections(), function(rec) {
				selectedRows.push(store.indexOf(rec));
			});
		}, this);
		
		store.on('load', function() {
			sm.selectRows(selectedRows);
			this.timer = setTimeout(function() {
				store.load();
			}, 500);
		}, this);
		
		this.on('close', function() {
			clearTimeout(this.timer);
		}, this);
		
		store.load();
			
		SchedulerManageDialog.superclass.initComponent.call(this);
	},
	
	pause: function() {
		var grid = this.get(0);
		var sm = grid.getSelectionModel();
		if(sm.hasSelection()) {
			var jobs = [];
			Ext.each(sm.getSelections(), function(rec) {
				jobs.push({name: rec.get('name'), group: rec.get('group')});
			});
			
			Ext.Ajax.request({
				url: GetUrl('schedule/pause.do'),
				method: 'POST',
				params: {jobs: Ext.encode(jobs)},
				failure: failureResponse
			});
		}
	},
	
	resume: function() {
		var jobs = [];
		var grid = this.get(0);
		var sm = grid.getSelectionModel();
		Ext.each(sm.getSelections(), function(rec) {
			jobs.push({name: rec.get('name'), group: rec.get('group')});
		});
		
		Ext.Ajax.request({
			url: GetUrl('schedule/resume.do'),
			method: 'POST',
			params: {jobs: Ext.encode(jobs)},
			failure: failureResponse
		});
	},
	
	remove: function() {
		var jobs = [];
		var grid = this.get(0);
		var sm = grid.getSelectionModel();
		Ext.each(sm.getSelections(), function(rec) {
			jobs.push({name: rec.get('name'), group: rec.get('group')});
		});
		
		Ext.Ajax.request({
			url: GetUrl('schedule/remove.do'),
			method: 'POST',
			params: {jobs: Ext.encode(jobs)},
			failure: failureResponse
		});
	},
	
	execute: function() {
		var grid = this.get(0);
		var sm = grid.getSelectionModel();
		if(sm.hasSelection()) {
			var rec = sm.getSelected();
			
			Ext.Ajax.request({
				url: GetUrl('schedule/executionConfiguration.do'),
				method: 'POST',
				params: {name: rec.get('name'), group: rec.get('group')},
				success: function(response) {
					var resObj = Ext.decode(response.responseText);
					var executionDialog = Ext.create({title: '手工执行', runMode: 'fix'}, resObj.executionDialog);
					executionDialog.on('beforestart', function(executionConfiguration) {
						executionDialog.close();
						
						Ext.Ajax.request({
							url: GetUrl('schedule/execute.do'),
							method: 'POST',
							params: {name: rec.get('name'), group: rec.get('group'), executionConfiguration: Ext.encode(executionConfiguration)},
							success: function(response) {
								
							},
							failure: failureResponse
						});
						
						return false;
					});
					
					executionDialog.show(null, function() {
						executionDialog.initLocalData(resObj);
					});
				},
				failure: failureResponse
			});
		}
	},
	
	showExecutionTrace: function (jobName)
	{
		clearTimeout(this.timer);
		var grid = this.get(0), store = grid.getStore();
		
		var dialog = new SchedulerLogDialog();
		dialog.on('close', function() {
			store.load();
		}, this);
		dialog.show(null, function() {
			dialog.initData(jobName);
		});
	}
});

