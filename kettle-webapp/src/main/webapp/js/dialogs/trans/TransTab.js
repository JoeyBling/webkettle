TransTab = Ext.extend(Ext.form.FormPanel, {
	title: '转换',
	bodyStyle: 'padding: 15px',
	defaultType: 'textfield',
	labelWidth: 90,
	
	initComponent: function() {
		var graph = getActiveGraph().getGraph(), root = graph.getDefaultParent();
		
		this.items = [{
			fieldLabel: '转换名称',
			anchor: '-10',
			allowBlank: false,
			name: 'name',
			value: root.getAttribute('name')
		},{
			fieldLabel: '转换文件',
			anchor: '-10',
			name: 'fileName',
			value: root.getAttribute('fileName')
		},{
			fieldLabel: '描述',
			anchor: '-10',
			name: 'description',
			value: root.getAttribute('description')
		},{
			fieldLabel: '扩展描述',
			xtype: 'textarea',
			anchor: '-10',
			name: 'extended_description',
			value: root.getAttribute('extended_description')
		},new Ext.form.ComboBox({
			fieldLabel: '状态',
			anchor: '-10',
			displayField: 'text',
			valueField: 'value',
			typeAhead: true,
	        mode: 'local',
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: new Ext.data.JsonStore({
	        	fields: ['value', 'text'],
	        	data: [{value: '0', text: ''},
	        	       {value: '1', text: '草案'},
	        	       {value: '2', text: '产品'}]
		    }),
		    hiddenName: 'trans_status',
			value: root.getAttribute('trans_status') || 0
		}),{
			fieldLabel: '版本',
			anchor: '-10',
			name: 'trans_version',
			value: root.getAttribute('trans_version')
		},{
			fieldLabel: '目录',
			anchor: '-10',
			name: 'directory',
			value: root.getAttribute('directory')
		},{
			fieldLabel: '创建者',
			anchor: '-10',
			name: 'created_user',
			value: root.getAttribute('created_user')
		},{
			fieldLabel: '创建时间',
			anchor: '-10',
			name: 'created_date',
			value: root.getAttribute('created_date')
		},{
			fieldLabel: '最近修改的用户',
			anchor: '-10',
			name: 'modified_user',
			value: root.getAttribute('modified_user')
		},{
			fieldLabel: '最近修改时间',
			anchor: '-10',
			name: 'modified_date',
			value: root.getAttribute('modified_date')
		}];
		TransTab.superclass.initComponent.call(this);
	}

});