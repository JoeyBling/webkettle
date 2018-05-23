JobEntrySetVariablesDialog = Ext.extend(KettleDialog, {
	width: 500,
	height: 450,
	title: '设置变量',
	initComponent: function() {
		var me = this,  graph = getActiveGraph().getGraph(),  cell = graph.getSelectionCell();
		
		var wFileVariableType = new Ext.form.ComboBox({
			fieldLabel: '变量有效范围',
			   store: Ext.StoreMgr.get('variableTypeStore'),
		        displayField: 'desc',
		        valueField: 'code',
		        typeAhead: true,
		        forceSelection: true,
		        triggerAction: 'all',
		        flex: 1,anchor: '-10',
		        selectOnFocus:true,
			value: cell.getAttribute('fileVariableType')
		});

		var wReplaceVars = new Ext.form.Checkbox({fieldLabel: '变量替换', flex: 1,anchor: '-10', checked: cell.getAttribute('replaceVars') == 'Y'});
		var wFilename = new Ext.form.TextField({fieldLabel: '属性文件名', flex: 1,anchor: '-10', value: cell.getAttribute('filename')});
		
		var form = new Ext.form.FormPanel({
			bodyStyle: 'padding: 15px',
			region: 'north',
			height: 200,
			labelAlign: 'right',
            border:false,
			labelWidth: 160,
			items: [{xtype: 'fieldset',
				title: '属性文件',
				anchor: '-10',
				flex: 1,
				items: [wFilename,wFileVariableType]
			},{xtype: 'fieldset',
				title: '设置',
				anchor: '-10',
				flex: 1,
				items: [wReplaceVars]
			}]
		});
		
		
		var store = new Ext.data.JsonStore({
			fields: [ 'variableName', 'variableType', 'variableValue'],
			data: Ext.decode(cell.getAttribute('fields') || Ext.encode([]))
		});
		
		var grid = new KettleEditorGrid({
			region: 'center',
			height: 100,
			autoScroll : true,
			columns: [new Ext.grid.RowNumberer(),{
				header: '变量名', dataIndex: 'variableName', width: 100, editor: new Ext.form.TextField()
			},{
				header: '值', dataIndex: 'variableValue', width: 100, editor: new Ext.form.TextField()
			},{
				header: '变量活动类型', dataIndex: 'variableType', width: 180, editor: new Ext.form.ComboBox({
			        store: Ext.StoreMgr.get('variableTypeStore'),
			        displayField: 'desc',
			        valueField: 'code',
			        typeAhead: true,
			        forceSelection: true,
			        triggerAction: 'all',
			        selectOnFocus:true
			    }), renderer: function(v)
				{
			    	var rec = Ext.StoreMgr.get('variableTypeStore').getById(v);
			    	if(rec) return rec.get('desc');
			    	return v;
				}
			}],
			store: store
		});
	
		this.getValues = function(){
			return {
				filename : wFilename.getValue(),
				replaceVars : wReplaceVars.getValue()  ? "Y" : "N" ,
				fileVariableType : wFileVariableType.getValue(),
				fields: Ext.encode(store.toJson())

			};
		};
		

//		this.fitItems = [form];
		
		

		this.fitItems ={layout: 'form',
		            border:false,
		items: [form, {
			bodyStyle: 'padding: 15px',
            layout: 'form', 
			region: 'souths',
			flex: 1,
	        border:false,
			height: 150,
			labelAlign: 'right',
			labelWidth: 0,
			hideLabel:true,
			items: [{xtype: 'label',
					text: '变量',
					style: 'padding-top: 5px',
					height: 25},
					grid]}]};
	

		JobEntrySetVariablesDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('SET_VARIABLES', JobEntrySetVariablesDialog);