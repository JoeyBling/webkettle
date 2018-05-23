TransDebugDialog = Ext.extend(Ext.Window, {
	title: '转换调试窗口',
	width: 700,
	height: 500,
	modal: true,
	layout: 'border',
	initComponent: function() {
		var me = this;
		
		var wRowCount = new Ext.form.NumberField({fieldLabel: '要获得的行数', anchor: '-10'});
		var wFirstRows = new Ext.form.Checkbox({fieldLabel: '获得前几行(预览)'});
		var wPauseBreakPoint = new Ext.form.Checkbox({fieldLabel: '满足条件时暂停转换'});
		var wCondition = new ConditionEditor({ anchor: '-1', height: 250, autoScroll: true });
		wCondition.setFieldFrom(false);
		
		var store = new Ext.data.JsonStore({
			fields: ['index', 'name', 'image', 'rowCount', 'firstRows', 'pauseBreakPoint', 'condition']
		});
		
		var wSteps = new Ext.grid.GridPanel({
			region: 'west',
			width: 220,
			split: true,
			hideHeaders: true,
			margins: '5 0 5 5',
			columns: [{
				header: '', dataIndex: 'image', width: 50, renderer: function(v) {
					return String.format('<img src="{0}"/>', GetUrl(v));
				}
			},{
				header: '', dataIndex: 'name', width: 140, renderer: function(v, meta, record) {
					if(Ext.isNumber(record.get('rowCount')))
						return '<div style="margin-top: 8px;font-weight:bold;color: blue">' + v + '</div>';
					else
						return '<div style="margin-top: 8px;font-weight:bold;">' + v + '</div>';
				}
			}],
			store: store
		});
		
		this.initData = function(data) {
			store.loadData(data);
		};
		
		store.on('load', function() {
			setTimeout(function() {
				wSteps.getSelectionModel().selectRow(0);
			}, 100);
		});
		
		var saveStepinfo = function(sm, row, record) {
			record.set('rowCount', wRowCount.getValue());
			record.set('firstRows', wFirstRows.getValue() ? 'Y' : 'N');
			record.set('pauseBreakPoint', wPauseBreakPoint.getValue() ? 'Y' : 'N');
			record.set('condition', wCondition.getValue());
			store.commitChanges();
		};
		
		wSteps.getSelectionModel().on('rowdeselect', function(sm, row, record) {
			saveStepinfo(sm, row, record);
		});
		
		wSteps.getSelectionModel().on('rowselect', function(sm, row, record) {
			wRowCount.setValue(record.get('rowCount'));
			wFirstRows.setValue(record.get('firstRows') == 'Y');
			wPauseBreakPoint.setValue(record.get('pauseBreakPoint') == 'Y');
			
			wCondition.setStepname(record.get('name'));
			wCondition.setValue(record.get('condition'));
		});
		
		this.items = [wSteps,{
			xtype: 'KettleForm',
			region: 'center',
			margins: '5 5 5 0',
			height: 200,
			labelWidth: 150,
			items: [wRowCount,wFirstRows, wPauseBreakPoint, wCondition]
		}];
		
		this.bbar = ['->', {
			text: '快速启动', scope: this, handler: function() {
				var sm = wSteps.getSelectionModel(), record = sm.getSelected();
				saveStepinfo(sm, store.indexOf(record), record);
				
				me.setDisabled(true);
				Ext.Ajax.request({
					url: GetUrl('trans/preview.do'),
					params: {graphXml: getActiveGraph().toXml(), selectedCells: Ext.encode(store.toJson())},
					method: 'POST',
					success: function(response) {
						me.setDisabled(false);
						decodeResponse(response, function(resObj) {
							me.close();
							setTimeout(function() {
								getActiveGraph().toDebug(resObj.message);
							}, 500);
						});
					},
					failure: failureResponse
				});
			}
		}, {
			text: '配置', scope: this, handler: function() {
				this.close();
			}
		},  {
			text: '关闭', scope: this, handler: function() {
				this.close();
			}
		}];
		
		TransDebugDialog.superclass.initComponent.call(this);
	}
});