DatabaseDialog = Ext.extend(Ext.Window, {
	title: '数据库连接',
	width: 700,
	height: 550,
	closeAction: 'close',
	modal: true,
	layout: 'border',
	operation:'',
	initComponent: function() {
		var deckOptionsBox = new ListView({
			valueField: 'value',
			store: new Ext.data.JsonStore({
				fields: ['value','text'],
				data: [
					{value: 0, text: '一般'},
					{value: 1, text: '高级'},
					{value: 2, text: '选项'},
					{value: 3, text: '连接池'},
					{value: 4, text: '集群'}]
			}),
			columns: [{
				dataIndex: 'value', hidden: true
			},{
				width: 1, dataIndex: 'text'
			}]
		});

		var normal = new NormalPanel();
		var advance = new AdvancePanel();
		var options = new OptionsPanel();
		var pool = new PoolPanel();
		var cluster = new ClusterPanel();

		var me = this;
		this.initReposityDatabase = function(database) {
			Ext.Ajax.request({
				url: GetUrl('repository/database.do'),
				method: 'POST',
				params: {name: database},
				scope: this,
				success: function(response) {
					var dbinfo = Ext.decode(response.responseText);
					this.initDatabase(dbinfo);
				}
			})
		};
		this.initTransDatabase = function(database) {
			Ext.Ajax.request({
				url: GetUrl('trans/database.do'),
				method: 'POST',
				params: {graphXml: getActiveGraph().toXml(), name: database},
				scope: this,
				success: function(response) {
					var dbinfo = Ext.decode(response.responseText);
					this.initDatabase(dbinfo);
				}
			})
		};
		this.initJobDatabase = function(database) {
			Ext.Ajax.request({
				url: GetUrl('job/database.do'),
				method: 'POST',
				params: {graphXml: getActiveGraph().toXml(), name: database},
				scope: this,
				success: function(response) {
					var dbinfo = Ext.decode(response.responseText);
					this.initDatabase(dbinfo);
				}
			})
		};

		this.initDatabase = function(dbinfo) {
			normal.initData(dbinfo);
			advance.initData(dbinfo);
			options.initData(dbinfo);
			pool.initData(dbinfo);
			cluster.initData(dbinfo);
		};

		this.getValue = function() {
			var val = normal.getValue();
			advance.getValue(val);
			options.getValue(val);
			pool.getValue(val);
			cluster.getValue(val);

			return val;
		};

		var content = new Ext.Panel({
			region: 'center',
			defaults: {border: false},
			layout: 'card',
			activeItem: 0,
			items: [normal, advance, options, pool, cluster]
		});

		deckOptionsBox.on('selectionchange', function(v) {
			content.getLayout().setActiveItem(deckOptionsBox.getValue());
		});

		this.on('afterrender', function() {
			deckOptionsBox.setValue(0);
		});

		this.items = [{
			region: 'west',
			width: 150,
			layout: 'fit',
			autoScroll: true,
			items: deckOptionsBox
		}, content];

		var bCancel = new Ext.Button({
			text: '取消', scope: this, handler: function() {
				this.close();
			}
		});
		var bTest = new Ext.Button({
			text: '测试', scope: this, handler: function() {
				Ext.Ajax.request({
					url: GetUrl('database/test.do'),
					method: 'POST',
					params: {databaseInfo: Ext.encode(me.getValue())},
					success: function(response) {
						decodeResponse(response, function(resObj) {
							var dialog = new EnterTextDialog();
							dialog.show(null, function() {
								dialog.setText(decodeURIComponent(resObj.message));
							});
						});
					}
				});
			}
		});
		var bFuture = new Ext.Button({
			text: '特征列表', scope: this, handler: function() {
				Ext.Ajax.request({
					url: GetUrl('database/features.do'),
					method: 'POST',
					params: {databaseInfo: Ext.encode(this.getValue())},
					success: function(response) {
						var records = Ext.decode(response.responseText);

						var grid = new DynamicEditorGrid({rowNumberer: true});
						var win = new Ext.Window({
							title: '特征列表',
							width: 1000,
							height: 600,
							modal: true,
							layout: 'fit',
							items: grid
						});
						win.show();

						grid.loadMetaAndValue(records);
					}
				});
			}
		});
		var bView = new Ext.Button({
			text: '浏览', scope: this, handler: function() {
				var dialog = new DatabaseExplorerDialog();
				dialog.show(null, function() {
					dialog.initDatabase(normal.getValue().name);
				}, this);

			}
		});
		var bOk = new Ext.Button({
			text: '确定', handler: function() {
				Ext.Ajax.request({
					url: GetUrl('database/check.do'),
					method: 'POST',
					params: {databaseInfo: Ext.encode(me.getValue())},
					success: function(response) {
						var json = Ext.decode(response.responseText);
						if(!json.success) {
							Ext.Msg.alert('系统提示', json.message);
						} else {
							me.fireEvent('create', me);
							Ext.getBody().mask('正在保存，请稍后...', 'x-mask-loading');
							Ext.Ajax.request({
								url: GetUrl('trans/save.do'),
								params: {graphXml: encodeURIComponent(activeGraph.toXml())},
								method: 'POST',
								success: function(response) {
									try{
										if(me.operation=='add'){
											Ext.MessageBox.alert("Success","添加成功!");
										}else{
											Ext.MessageBox.alert("Success","已保存!");
										}
									}finally{
										Ext.getBody().unmask();
									}
								},
								failure: failureResponse
							});
						}
					}
				});
			}
		});

		this.bbar = ['->', bCancel, bTest, bFuture, bView, bOk];

		DatabaseDialog.superclass.initComponent.call(this);

		this.addEvents('create')
	}
});

Ext.reg('DatabaseDialog', DatabaseDialog);
