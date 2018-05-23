Denormaliser = Ext.extend(KettleDialog, {
    title: '列转行',
    width: 1050,
    height: 600,
    initComponent: function() {
        var me = this, cell = getActiveGraph().getGraph().getSelectionCell();
        var typeStore = new Ext.data.JsonStore({
            fields: ['type'],
            proxy: new Ext.data.HttpProxy({
                url: '/ExcelOutput/columnType.do'
            })
        });
        var formatStore = new Ext.data.JsonStore({
            fields: ['format'],
            proxy: new Ext.data.HttpProxy({
                url: '/ExcelOutput/columnFormats.do'
            })
        });
        var aggreStore= new Ext.data.JsonStore({
            fields: ['aggre'],
            proxy: new Ext.data.HttpProxy({
                url: '/denormaliser/aggre.do'
            })
        });
        var groupFieldStore = new Ext.data.JsonStore({
            fields: ['name'],
            data: Ext.decode(cell.getAttribute('group'))
        });
        var fieldStore = new Ext.data.JsonStore({
            fields: ['target_name', 'field_name','key_value','target_type', 'target_format','target_length',
                'target_precision', 'target_currency_symbol','target_decimal_symbol','target_grouping_symbol',
                'target_null_string','target_aggregation_type'],
            data: Ext.decode(cell.getAttribute('fields'))
        });


        this.saveData = function(){
            var data = {
                typefield:Ext.encode(groupFieldStore.toJson()),
                key_field:wKeyField.getValue(),
                fields:Ext.encode(fieldStore.toJson())
            };
            return data;
        };

        var wKeyField=new Ext.form.ComboBox({
            region: 'north',
            fieldLabel: 'key field',
            triggerAction:"all",
            store:getActiveGraph().inputFields(cell.getAttribute('label')),
            displayField:"name",
            valueField:"name",
            emptyText:"please choose ket Field"
        })
        wKeyField.setValue(cell.getAttribute("key_field"));

        var editorGridGet=new KettleEditorGrid({
            region: 'center',
            xtype: 'KettleEditorGrid',
            height: 200,
            title:"该字段用来进行分组标识",
            columns: [new Ext.grid.RowNumberer(),{
                header:"分组字段", dataIndex: 'name', width:200, editor: new Ext.form.ComboBox({
                    displayField: 'name',
                    valueField: 'name',
                    typeAhead: true,
                    forceSelection: true,
                    triggerAction: 'all',
                    selectOnFocus:true,
                    store: getActiveGraph().inputFields(cell.getAttribute('label'))
                })
            }],
            store:groupFieldStore
        })

        var editorGridTarget=new KettleEditorGrid({
            height: 300,
            region: 'south',
            xtype: 'KettleEditorGrid',
            title:"目标字段描述",
            columns: [new Ext.grid.RowNumberer(),
                {
                    header:"目标字段名",dataIndex: 'target_name',editor:new Ext.form.TextField()
                },{
                    header:"源字段名",dataIndex: 'field_name',editor:new Ext.form.TextField()
                },{
                    header:"key-value",dataIndex: 'key_value',editor:new Ext.form.TextField()
                },{
                    header:"目标字段类型",dataIndex: 'target_type', editor: new Ext.form.ComboBox({
                        displayField: 'type',
                        valueField: 'type',
                        typeAhead: true,
                        forceSelection: true,
                        triggerAction: 'all',
                        selectOnFocus:true,
                        store:typeStore
                    })
                },{
                    header:"字段格式",dataIndex: 'target_format', editor: new Ext.form.ComboBox({
                        displayField: 'format',
                        valueField: 'format',
                        typeAhead: true,
                        forceSelection: true,
                        triggerAction: 'all',
                        selectOnFocus:true,
                        store: formatStore
                    })
                },{
                    header:"长度",dataIndex: 'target_length',editor:new Ext.form.TextField()
                },{
                    header:"精度",dataIndex: 'target_precision',editor:new Ext.form.TextField()
                },{
                    header:"货币符",dataIndex: 'target_currency_symbol',editor:new Ext.form.TextField()
                },{
                    header:"小数符",dataIndex: 'target_decimal_symbol',editor:new Ext.form.TextField()
                },{
                    header:"分组符",dataIndex: 'target_grouping_symbol',editor:new Ext.form.TextField()
                },{
                    header:"null if",dataIndex: 'target_null_string',editor:new Ext.form.TextField()
                },{
                    header:"聚合",dataIndex: 'target_aggregation_type', editor: new Ext.form.ComboBox({
                        displayField: 'aggre',
                        valueField: 'aggre',
                        typeAhead: true,
                        forceSelection: true,
                        triggerAction: 'all',
                        selectOnFocus:true,
                        store: aggreStore
                    })
                }

            ],
            tbar: [{
                text: '获取字段', handler: function(btn) {
                    getActiveGraph().inputOutputFields(cell.getAttribute('label'), true, function(store) {
                        fieldStore.merge(store, [{name: 'target_name', field: 'name'},{name:'target_type',field:'type'},
                            {name: 'target_length', field: 'length'},{name: 'field_name', field: 'name'},
                            {name: 'target_precision', field: 'precision'}]);
                    });
                }
            }],
            store:fieldStore
        })

        this.fitItems = {
            layout: 'border',
            border: false,
            items: [wKeyField,editorGridGet,editorGridTarget]
        };

        Denormaliser.superclass.initComponent.call(this);
    }
});

Ext.reg('Denormaliser', Denormaliser);