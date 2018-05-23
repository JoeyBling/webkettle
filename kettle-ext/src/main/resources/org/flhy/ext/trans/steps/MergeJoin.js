MergeJoinDialog = Ext.extend(KettleDialog, {
	title: BaseMessages.getString(PKG, "MergeJoinDialog.Shell.Label"),
	width: 600,
	height: 400,
	initComponent: function() {
		var me = this;
		
		var wStep1 = new Ext.form.ComboBox({
			fieldLabel: BaseMessages.getString(PKG, "MergeJoinDialog.Step1.Label"),
			anchor: '-10',
			displayField: 'name',
			valueField: 'name',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: getActiveGraph().previousSteps(cell.getAttribute('label'))
	    });
		
		var wStep2 = new Ext.form.ComboBox({
			fieldLabel: BaseMessages.getString(PKG, "MergeJoinDialog.Step2.Label"),
			anchor: '-10',
			displayField: 'name',
			valueField: 'name',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: getActiveGraph().previousSteps(cell.getAttribute('label'))
	    });
		
		var wType = new Ext.form.ComboBox({
			fieldLabel: BaseMessages.getString(PKG, "MergeJoinDialog.Type.Label"),
			anchor: '-10',
			displayField: 'name',
			valueField: 'name',
			typeAhead: true,
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: Ext.StoreMgr.get('mergejointypeStore')
	    });
		
		var key1Store = new Ext.data.JsonStore({
			fields: ['key']
		});
		var key2Store = new Ext.data.JsonStore({
			fields: ['key']
		});
		
		this.initData = function() {
			var cell = this.getInitData();
			MergeJoinDialog.superclass.initData.apply(this, [cell]);
			
			wStep1.setValue(cell.getAttribute('step1'));
			wStep2.setValue(cell.getAttribute('step2'));
			wType.setValue(cell.getAttribute('join_type'));
			key1Store.loadData(Ext.decode(cell.getAttribute('key1')));
			key2Store.loadData(Ext.decode(cell.getAttribute('key2')));
		};
		
		this.saveData = function(){
			var data = {};
			data.step1 = wStep1.getValue();
			data.step2 = wStep2.getValue();
			data.join_type = wType.getValue();
			data.key1 = Ext.encode(key1Store.toJson());
			data.key2 = Ext.encode(key2Store.toJson());
			
			return data;
		};
		
		var key1Grid = new KettleEditorGrid({
			flex: 1,
			margins: '0 3 0 0',
			title: BaseMessages.getString(PKG, "MergeJoinDialog.Keys1.Label"),
			menuAdd: function(menu) {
				menu.insert(0, {
					text: BaseMessages.getString(PKG, "MergeJoinDialog.KeyFields1.Button"), scope: this, handler: function() {
						getActiveGraph().inputOutputFields(wStep1.getValue(), false, function(s) {
							key1Store.merge(s, [{name: 'key', field: 'name'}]);
						});
					}
				});
				menu.insert(1, '-');
			},
			columns: [new Ext.grid.RowNumberer(), {
				header: BaseMessages.getString(PKG, "MergeJoinDialog.ColumnInfo.KeyField1"), dataIndex: 'key', width: 100, editor: new Ext.form.TextField()
			}],
			store: key1Store
		});
		
		var key2Grid = new KettleEditorGrid({
			flex: 1,
			margins: '0 0 0 3',
			title: BaseMessages.getString(PKG, "MergeJoinDialog.Keys2.Label"),
			menuAdd: function(menu) {
				menu.insert(0, {
					text: BaseMessages.getString(PKG, "MergeJoinDialog.KeyFields2.Button"), scope: this, handler: function() {
						getActiveGraph().inputOutputFields(wStep2.getValue(), false, function(s) {
							key2Store.merge(s, [{name: 'key', field: 'name'}]);
						});
					}
				});
				menu.insert(1, '-');
			},
			columns: [new Ext.grid.RowNumberer(), {
				header: BaseMessages.getString(PKG, "MergeJoinDialog.ColumnInfo.KeyField2"), dataIndex: 'key', width: 100, editor: new Ext.form.TextField()
			}],
			store: key2Store
		});
		
		this.fitItems = {
				layout: 'border',
				border: false,
				items: [{
					region: 'north',
					height: 100,
					xtype: 'KettleForm',
					margins: '0 0 6 0',
					items: [wStep1, wStep2, wType]
				}, {
					region: 'center',
					layout:'hbox',
					layoutConfig: {
					    align : 'stretch',
					    pack  : 'start',
					},
					border: false,
					items: [key1Grid, key2Grid]
				}]
		};
		
		
		MergeJoinDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('MergeJoin', MergeJoinDialog);