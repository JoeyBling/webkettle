JsonInputDialog = Ext.extend(KettleTabDialog, {
	title: BaseMessages.getString(PKG, "JsonInputDialog.DialogTitle"),
	width: 700,
	height: 600,
	initComponent: function() {
		var cell = getActiveGraph().getGraph().getSelectionCell();
		var wSourceStreamField = new Ext.form.Checkbox({fieldLabel: BaseMessages.getString(PKG, "JsonInputDialog.wlSourceStreamField.Label")});
		var wSourceIsAFile = new Ext.form.Checkbox({fieldLabel: BaseMessages.getString(PKG, "JsonInputDialog.SourceIsAFile.Label"), disabled: true});
		var wreadUrl = new Ext.form.Checkbox({fieldLabel: BaseMessages.getString(PKG, "JsonInputDialog.readUrl.Label"), disabled: true});
		var wFieldValue = new Ext.form.ComboBox({
			fieldLabel: BaseMessages.getString(PKG, "JsonInputDialog.wlSourceField.Label"),
			anchor: '-10',
			disabled: true,
			displayField: 'name',
			valueField: 'name',
			typeAhead: true,
	        mode: 'local',
	        forceSelection: true,
	        triggerAction: 'all',
	        selectOnFocus:true,
			store: getActiveGraph().inputFields(cell.getAttribute('label'))
		});
		
		var fileStore = new Ext.data.JsonStore({
			fields: ['name', 'filemask', 'exclude_filemask', 'file_required', 'include_subfolders']
		});
		//-------------for content-----------
		var wIgnoreEmptyFile = new Ext.form.Checkbox({fieldLabel: BaseMessages.getString(PKG, "JsonInputDialog.IgnoreEmptyFile.Label")});
		var wdoNotFailIfNoFile = new Ext.form.Checkbox({fieldLabel: BaseMessages.getString(PKG, "JsonInputDialog.doNotFailIfNoFile.Label")});
		var wIgnoreMissingPath = new Ext.form.Checkbox({fieldLabel: BaseMessages.getString(PKG, "JsonInputDialog.IgnoreMissingPath.Label")});
		var wLimit = new Ext.form.TextField({fieldLabel: BaseMessages.getString(PKG, "JsonInputDialog.Limit.Label"), anchor: '-10'});
		
		var wInclFilename = new Ext.form.Checkbox({fieldLabel: BaseMessages.getString(PKG, "JsonInputDialog.InclFilename.Label")});
		var wInclFilenameField = new Ext.form.TextField({fieldLabel: BaseMessages.getString(PKG, "JsonInputDialog.InclFilenameField.Label"), anchor: '-10'});
		var wInclRownum = new Ext.form.Checkbox({fieldLabel: BaseMessages.getString(PKG, "JsonInputDialog.InclRownum.Label")});
		var wInclRownumField = new Ext.form.TextField({fieldLabel: BaseMessages.getString(PKG, "JsonInputDialog.InclRownumField.Label"), anchor: '-10'});
		
		var wAddResult = new Ext.form.Checkbox({fieldLabel: BaseMessages.getString(PKG, "JsonInputDialog.AddResult.Label")});
		
		///----------------for column----------
		var store = new Ext.data.JsonStore({
			fields: ['name', 'path', 'type', 'format', 'length', 'precision', 'currency', 'decimal', 'group', 'trim_type', 'repeat']
		});
		
		// ---- for other column
		var wShortFileFieldName = new Ext.form.TextField({fieldLabel: BaseMessages.getString(PKG, "JsonInputDialog.ShortFileFieldName.Label"), anchor: '-10'});
		var wExtensionFieldName = new Ext.form.TextField({fieldLabel: BaseMessages.getString(PKG, "JsonInputDialog.ExtensionFieldName.Label"), anchor: '-10'});
		var wPathFieldName = new Ext.form.TextField({fieldLabel: BaseMessages.getString(PKG, "JsonInputDialog.PathFieldName.Label"), anchor: '-10'});
		var wSizeFieldName = new Ext.form.TextField({fieldLabel: BaseMessages.getString(PKG, "JsonInputDialog.SizeFieldName.Label"), anchor: '-10'});
		var wIsHiddenName = new Ext.form.TextField({fieldLabel: BaseMessages.getString(PKG, "JsonInputDialog.IsHiddenName.Label"), anchor: '-10'});
		var wLastModificationTimeName = new Ext.form.TextField({fieldLabel: BaseMessages.getString(PKG, "JsonInputDialog.LastModificationTimeName.Label"), anchor: '-10'});
		var wUriName = new Ext.form.TextField({fieldLabel: BaseMessages.getString(PKG, "JsonInputDialog.UriName.Label"), anchor: '-10'});
		var wRootUriName = new Ext.form.TextField({fieldLabel: BaseMessages.getString(PKG, "JsonInputDialog.RootUriName.Label"), anchor: '-10'});
		
		this.initData = function() {
			var cell = this.getInitData();
			JsonInputDialog.superclass.initData.apply(this, [cell]);
			
			wSourceStreamField.setValue('Y' == cell.getAttribute('IsInFields'));
			wSourceIsAFile.setValue('Y' == cell.getAttribute('IsAFile'));
			wreadUrl.setValue('Y' == cell.getAttribute('readurl'));
			wFieldValue.setValue(cell.getAttribute('valueField'));
			fileStore.loadData(Ext.decode(cell.getAttribute('file')));
			
			wIgnoreEmptyFile.setValue('Y' == cell.getAttribute('IsIgnoreEmptyFile'));
			wdoNotFailIfNoFile.setValue('Y' == cell.getAttribute('doNotFailIfNoFile'));
			wIgnoreMissingPath.setValue('Y' == cell.getAttribute('ignoreMissingPath'));
			wLimit.setValue(cell.getAttribute('limit'));
			wInclFilename.setValue('Y' == cell.getAttribute('include'));
			wInclFilenameField.setValue(cell.getAttribute('include_field'));
			wInclRownum.setValue('Y' == cell.getAttribute('rownum'));
			wInclRownumField.setValue(cell.getAttribute('rownum_field'));
			wAddResult.setValue('Y' == cell.getAttribute('addresultfile'));
			
			store.loadData(Ext.decode(cell.getAttribute('fields')));
			
			wShortFileFieldName.setValue(cell.getAttribute('shortFileFieldName'));
			wExtensionFieldName.setValue(cell.getAttribute('extensionFieldName'));
			wPathFieldName.setValue(cell.getAttribute('pathFieldName'));
			wSizeFieldName.setValue(cell.getAttribute('sizeFieldName'));
			wIsHiddenName.setValue(cell.getAttribute('hiddenFieldName'));
			wLastModificationTimeName.setValue(cell.getAttribute('lastModificationTimeFieldName'));
			wUriName.setValue(cell.getAttribute('uriNameFieldName'));
			wRootUriName.setValue(cell.getAttribute('rootUriNameFieldName'));
		};
		
		this.saveData = function(){
			var data = {};
			
			data.IsInFields = wSourceStreamField.getValue() ? 'Y': 'N';
			data.IsAFile = wSourceIsAFile.getValue() ? 'Y': 'N';
			data.readurl = wreadUrl.getValue() ? 'Y': 'N';
			data.valueField = wFieldValue.getValue();
			data.file = Ext.encode(fileStore.toJson());
			
			data.IsIgnoreEmptyFile = wIgnoreEmptyFile.getValue() ? 'Y': 'N';
			data.doNotFailIfNoFile = wdoNotFailIfNoFile.getValue() ? 'Y': 'N';
			data.ignoreMissingPath = wIgnoreMissingPath.getValue() ? 'Y': 'N';
			data.limit = wLimit.getValue();
			data.include = wInclFilename.getValue() ? 'Y': 'N';
			data.include_field = wInclFilenameField.getValue();
			data.rownum = wInclRownum.getValue() ? 'Y': 'N';
			data.rownum_field = wInclRownumField.getValue();
			data.addresultfile = wAddResult.getValue() ? 'Y': 'N';
			
			data.fields = Ext.encode(store.toJson());
			
			data.shortFileFieldName = wShortFileFieldName.getValue();
			data.extensionFieldName = wExtensionFieldName.getValue();
			data.pathFieldName = wPathFieldName.getValue();
			data.sizeFieldName = wSizeFieldName.getValue();
			data.hiddenFieldName = wIsHiddenName.getValue();
			data.lastModificationTimeFieldName = wLastModificationTimeName.getValue();
			data.uriNameFieldName = wUriName.getValue();
			data.rootUriNameFieldName = wRootUriName.getValue();
			
			return data;
		};
		
		var grid = new KettleEditorGrid({
			title: BaseMessages.getString(PKG, "JsonInputDialog.FilenameList.Label"),
			region: 'center',
			columns: [new Ext.grid.RowNumberer(), {
				header: BaseMessages.getString(PKG, "JsonInputDialog.Files.Filename.Column"), dataIndex: 'name', width: 250, editor: new Ext.form.TextField({
	                allowBlank: false
	            })
			}, {
				header: BaseMessages.getString(PKG, "JsonInputDialog.Files.Wildcard.Column"), dataIndex: 'filemask', width: 120, editor: new Ext.form.TextField({
	                allowBlank: false
	            })
			}, {
				header: BaseMessages.getString(PKG, "JsonInputDialog.Files.ExcludeWildcard.Column"), dataIndex: 'exclude_filemask', width: 120, editor: new Ext.form.TextField({
	                allowBlank: false
	            })
			},{
				header: BaseMessages.getString(PKG, "JsonInputDialog.Required.Column"), dataIndex: 'file_required', width: 60, renderer: function(v)
				{
					if(v == 'N') 
						return '否'; 
					else if(v == 'Y') 
						return '是';
					return v;
				}, editor: new Ext.form.ComboBox({
					store: new Ext.data.JsonStore({
			        	fields: ['value', 'text'],
			        	data: [{value: 'Y', text: '是'},
			        	       {value: 'N', text: '否'}]
			        }),
			        displayField: 'text',
			        valueField: 'value',
			        typeAhead: true,
			        mode: 'local',
			        forceSelection: true,
			        triggerAction: 'all',
			        selectOnFocus:true
			    })
			},{
				header: BaseMessages.getString(PKG, "JsonInputDialog.IncludeSubDirs.Column"), dataIndex: 'include_subfolders', width: 80, renderer: function(v)
				{
					if(v == 'N') 
						return '否'; 
					else if(v == 'Y') 
						return '是';
					return v;
				}, editor: new Ext.form.ComboBox({
			        store: new Ext.data.JsonStore({
			        	fields: ['value', 'text'],
			        	data: [{value: 'Y', text: '是'},
			        	       {value: 'N', text: '否'}]
			        }),
			        displayField: 'text',
			        valueField: 'value',
			        typeAhead: true,
			        mode: 'local',
			        forceSelection: true,
			        triggerAction: 'all',
			        selectOnFocus:true
			    })
			}],
			store: fileStore			
		});
		
		this.tabItems = [{
			title: BaseMessages.getString(PKG, "JsonInputDialog.Files.Filename.Column"),
			layout: 'border',
			defaults: {border: false},
			items: [{
				xtype: 'KettleForm',
				bodyStyle: 'padding: 5px 10px',
				region: 'north',
				height: 160,
				items: [{
					xtype: 'fieldset',
					title: BaseMessages.getString(PKG, "JsonInputDialog.wOutputField.Label"),
					labelWidth: 200,
					items: [wSourceStreamField, wSourceIsAFile, wreadUrl, wFieldValue]
				}]
			}, grid]
		}, {
			title: BaseMessages.getString(PKG, "JsonInputDialog.Content.Tab"),
			xtype: 'KettleForm',
			bodyStyle: 'padding: 10px',
			labelWidth: 200,
			items: [{
				xtype: 'fieldset',
				title: BaseMessages.getString(PKG, "JsonInputDialog.wConf.Label"),
				items: [wIgnoreEmptyFile, wdoNotFailIfNoFile, wIgnoreMissingPath, wLimit]
			},{
				xtype: 'fieldset',
				title: BaseMessages.getString(PKG, "JsonInputDialog.wAdditionalFields.Label"),
				items: [wInclFilename, wInclFilenameField, wInclRownum, wInclRownumField]
			},{
				xtype: 'fieldset',
				title: BaseMessages.getString(PKG, "JsonInputDialog.wAddFileResult.Label"),
				items: [wAddResult]
			}]
		}, {
			xtype: 'KettleEditorGrid',
			title: BaseMessages.getString(PKG, "JsonInputDialog.Fields.Tab"),
			columns: [new Ext.grid.RowNumberer(), {
				header: BaseMessages.getString(PKG, "JsonInputDialog.FieldsTable.Name.Column"), dataIndex: 'name', width: 100, editor: new Ext.form.TextField({
	                allowBlank: false
	            })
			}, {
				header: BaseMessages.getString(PKG, "JsonInputDialog.FieldsTable.Path.Column"), dataIndex: 'path', width: 100, editor: new Ext.form.TextField({
	                allowBlank: false
	            })
			},{
				header: BaseMessages.getString(PKG, "JsonInputDialog.FieldsTable.Type.Column"), dataIndex: 'type', width: 100, editor: new Ext.form.ComboBox({
			        store: Ext.StoreMgr.get('valueMetaStore'),
			        displayField: 'name',
			        valueField: 'name',
			        typeAhead: true,
			        mode: 'local',
			        forceSelection: true,
			        triggerAction: 'all',
			        selectOnFocus:true
			    })
			},{
				header: BaseMessages.getString(PKG, "JsonInputDialog.FieldsTable.Format.Column"), dataIndex: 'format', width: 150, editor: new Ext.form.ComboBox({
			        store: new Ext.data.JsonStore({
			        	fields: ['value'],
			        	data: [{value: 'yyyy-MM-dd HH:mm:ss'},
			        	       {value: 'yyyy/MM/dd HH:mm:ss'},
			        	       {value: 'yyyy-MM-dd'},
			        	       {value: 'yyyy/MM/dd'},
			        	       {value: 'yyyyMMdd'},
			        	       {value: 'yyyyMMddHHmmss'}]
			        }),
			        displayField:'value',
			        typeAhead: true,
			        mode: 'local',
			        forceSelection: true,
			        triggerAction: 'all',
			        selectOnFocus:true
			    })
			},{
				header: BaseMessages.getString(PKG, "JsonInputDialog.FieldsTable.Length.Column"), dataIndex: 'length', width: 50, editor: new Ext.form.NumberField()
			},{
				header: BaseMessages.getString(PKG, "JsonInputDialog.FieldsTable.Precision.Column"), dataIndex: 'precision', width: 100, editor: new Ext.form.TextField()
			},{
				header: BaseMessages.getString(PKG, "JsonInputDialog.FieldsTable.Currency.Column"), dataIndex: 'currency', width: 100, editor: new Ext.form.TextField()
			},{
				header: BaseMessages.getString(PKG, "JsonInputDialog.FieldsTable.Decimal.Column"), dataIndex: 'decimal', width: 100, editor: new Ext.form.TextField()
			},{
				header: BaseMessages.getString(PKG, "JsonInputDialog.FieldsTable.Group.Column"), dataIndex: 'group', width: 100, editor: new Ext.form.TextField()
			},{
				header: BaseMessages.getString(PKG, "JsonInputDialog.FieldsTable.TrimType.Column"), dataIndex: 'trim_type', width: 100, renderer: function(v)
				{
					if(v == 'none') 
						return BaseMessages.getString(PKG, "JsonInputField.TrimType.None"); 
					else if(v == 'left') 
						return BaseMessages.getString(PKG, "JsonInputField.TrimType.Left");
					else if(v == 'right') 
						return BaseMessages.getString(PKG, "JsonInputField.TrimType.Right");
					else if(v == 'both') 
						return BaseMessages.getString(PKG, "JsonInputField.TrimType.None");
					return v;
				}, editor: new Ext.form.ComboBox({
			        store: new Ext.data.JsonStore({
			        	fields: ['value', 'text'],
			        	data: [{value: 'none', text: BaseMessages.getString(PKG, "JsonInputField.TrimType.None")},
			        	       {value: 'left', text: BaseMessages.getString(PKG, "JsonInputField.TrimType.Left")},
			        	       {value: 'right', text: BaseMessages.getString(PKG, "JsonInputField.TrimType.Right")},
			        	       {value: 'both', text: BaseMessages.getString(PKG, "JsonInputField.TrimType.None")}]
			        }),
			        displayField: 'text',
			        valueField: 'value',
			        typeAhead: true,
			        mode: 'local',
			        forceSelection: true,
			        triggerAction: 'all',
			        selectOnFocus:true
			    })
			},{
				header: BaseMessages.getString(PKG, "JsonInputDialog.FieldsTable.Repeat.Column"), dataIndex: 'repeat', width: 80, renderer: function(v)
				{
					if(v == 'N') 
						return '否'; 
					else if(v == 'Y') 
						return '是';
					return v;
				}, editor: new Ext.form.ComboBox({
			        store: new Ext.data.JsonStore({
			        	fields: ['value', 'text'],
			        	data: [{value: 'Y', text: '是'},
			        	       {value: 'N', text: '否'}]
			        }),
			        displayField: 'text',
			        valueField: 'value',
			        typeAhead: true,
			        mode: 'local',
			        forceSelection: true,
			        triggerAction: 'all',
			        selectOnFocus:true
			    })
			}],
			store: store
		}, {
			title: BaseMessages.getString(PKG, "JsonInputDialog.AdditionalFieldsTab.TabTitle"),
			xtype: 'KettleForm',
			bodyStyle: 'padding: 10px',
			labelWidth: 120,
			items: [wShortFileFieldName, wExtensionFieldName, wPathFieldName, wSizeFieldName, wIsHiddenName, wLastModificationTimeName, wUriName, wRootUriName]
		}];
		
		wSourceStreamField.on('check', function(cb, checked) {
			if(checked === true) {
				wSourceIsAFile.enable();
				wreadUrl.enable();
				wFieldValue.enable();
				grid.disable();
			} else {
				wSourceIsAFile.disable();
				wreadUrl.disable();
				wFieldValue.disable();
				grid.enable();
			}
		});
		
		JsonInputDialog.superclass.initComponent.call(this);
	}
});

Ext.reg('JsonInput', JsonInputDialog);
