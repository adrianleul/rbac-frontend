import React, { useEffect, useState } from "react";
import {
  Modal,
  Form,
  Input,
  InputNumber,
  Radio,
  Tooltip,
  Row,
  Col,
} from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import IconSelect from "../../../../components/modal/IconSelect";// import SvgIcon from "./SvgIcon"; // Your custom SvgIcon component
import SelectMenu from '../../../../components/ui/admin/SelectMenu';

interface DictOption {
  value: string;
  label: string;
}

interface MenuDialogProps {
  open: boolean;
  title: string;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  dict: any;
}

const MenuDialog: React.FC<MenuDialogProps> = ({
  open,
  title,
  onCancel,
  onSubmit,
  formData,
  setFormData,
  dict,
}) => {
  const [form] = Form.useForm();
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (open) {
      form.setFieldsValue(formData);
      setReloadKey(Date.now()); // force SelectMenu to reload
    }
  }, [open, formData]);

  const handleOk = () => {
    form.validateFields().then(values => {
      // If editing, include menuId in the submission
      if (formData.menuId !== undefined) {
        onSubmit({ ...values, menuId: formData.menuId });
      } else {
        onSubmit(values);
      }
    });
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      width={680}
      centered
    >
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item name="parentId" label="Previous menu">
              <SelectMenu
                value={form.getFieldValue('parentId')}
                onChange={value => {
                  setFormData({ ...formData, parentId: value });
                  form.setFieldsValue({ parentId: value });
                }}
                reloadKey={reloadKey}
              />
            </Form.Item>
          </Col>

          <Col span={24}>
            <Form.Item name="menuType" label="Menu type">
              <Radio.Group
                onChange={e => setFormData({ ...formData, menuType: e.target.value })}
              >
                <Radio value="M">Table of contents</Radio>
                <Radio value="C">Menu</Radio>
                <Radio value="F">Button</Radio>
              </Radio.Group>
            </Form.Item>
          </Col>

          {formData.menuType !== "F" && (
            <Col span={24}>
              <Form.Item name="icon" label="Menu icon">
                <IconSelect
                  value={formData.icon}
                  onChange={icon => setFormData({ ...formData, icon })}
                />
              </Form.Item>
            </Col>
          )}

          <Col span={12}>
            <Form.Item name="menuName" label="Menu name">
              <Input placeholder="Please enter a menu name" />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="orderNum"
              label="Show sort"
              rules={[{ required: true, message: 'Show sort is required' }, { type: 'number', min: 1, message: 'Show sort must be at least 1' }]}
            >
              <InputNumber min={1} style={{ width: "100%" }} />
            </Form.Item>
          </Col>

          {formData.menuType !== "F" && (
            <>
              <Col span={12}>
                <Form.Item
                  name="isFrame"
                  label={
                    <span>
                      <Tooltip title="If external link, routing should start with http(s)://">
                        <QuestionCircleOutlined />
                      </Tooltip>{" "}
                      Whether to external link
                    </span>
                  }
                >
                  <Radio.Group>
                    <Radio value="0">Yes</Radio>
                    <Radio value="1">No</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="path"
                  label={
                    <span>
                      <Tooltip title="Enter the routing address, e.g. 'user'">
                        <QuestionCircleOutlined />
                      </Tooltip>{" "}
                      Routing address
                    </span>
                  }
                >
                  <Input placeholder="Please enter routing address" />
                </Form.Item>
              </Col>
            </>
          )}

          {formData.menuType === "C" && (
            <>
              <Col span={12}>
                <Form.Item
                  name="component"
                  label={
                    <span>
                      <Tooltip title="e.g. 'system/user/index' under views/">
                        <QuestionCircleOutlined />
                      </Tooltip>{" "}
                      Component path
                    </span>
                  }
                >
                  <Input placeholder="Please enter component path" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="query"
                  label={
                    <span>
                      <Tooltip title='e.g. {"id": 1, "name": "ry"}'>
                        <QuestionCircleOutlined />
                      </Tooltip>{" "}
                      Routing parameters
                    </span>
                  }
                >
                  <Input placeholder="Please enter routing parameters" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  name="isCache"
                  label={
                    <span>
                      <Tooltip title="Use keep-alive if cache enabled, match component `name`">
                        <QuestionCircleOutlined />
                      </Tooltip>{" "}
                      Whether to cache
                    </span>
                  }
                >
                  <Radio.Group>
                    <Radio value="0">Cache</Radio>
                    <Radio value="1">Do not cache</Radio>
                  </Radio.Group>
                </Form.Item>
              </Col>
            </>
          )}

          {formData.menuType !== "F" && (
            <Col span={12}>
              <Form.Item
                name="visible"
                label={
                  <span>
                    <Tooltip title="Hide route from sidebar but still accessible">
                      <QuestionCircleOutlined />
                    </Tooltip>{" "}
                    Show status
                  </span>
                }
              >
                <Radio.Group>
                  {dict.type.sys_show_hide.map((option: DictOption) => (
                    <Radio key={option.value} value={option.value}>
                      {option.label}
                    </Radio>
                  ))}
                </Radio.Group>
              </Form.Item>
            </Col>
          )}

          <Col span={12}>
            <Form.Item
              name="perms"
              label={
                <span>
                  <Tooltip title="e.g. @PreAuthorize(`@ss.hasPermi('system:user:list')`)">
                    <QuestionCircleOutlined />
                  </Tooltip>{" "}
                  Permission characters
                </span>
              }
            >
              <Input placeholder="Please enter permission ID" maxLength={100} />
            </Form.Item>
          </Col>

          <Col span={12}>
            <Form.Item
              name="status"
              label={
                <span>
                  <Tooltip title="Disabled routes won't be visible or accessible">
                    <QuestionCircleOutlined />
                  </Tooltip>{" "}
                  Menu status
                </span>
              }
            >
              <Radio.Group>
                {dict.type.sys_show_hide.map((option: DictOption) => (
                  <Radio key={option.value} value={option.value}>
                    {option.label}
                  </Radio>
                ))}
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default MenuDialog;
