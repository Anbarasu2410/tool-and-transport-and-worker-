import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Form, 
  Button, 
  Table, 
  Tag,
  Space,
  Descriptions,
  message,
  Spin,
  Modal,
  Select,
  Alert,
  Row,
  Col,
  DatePicker,
  Input,
  Divider,
  Badge
} from 'antd';
import { 
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  ExclamationCircleOutlined,
  CarOutlined,
  ToolOutlined,
  BoxPlotOutlined,
  UserOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  ArrowLeftOutlined
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import BaseFields from "../components/TaskForm/BaseFields";
import dynamicSections from "../components/TaskForm/DynamicSections";

const { Title, Text } = Typography;
const { Option } = Select;
const { confirm } = Modal;
const { TextArea } = Input;

const API_BASE_URL = 'http://localhost:5000/api';

const TaskPage = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [projects, setProjects] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [form] = Form.useForm();
  const [taskType, setTaskType] = useState('WORK');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCompanies();
    fetchProjects();
    fetchTasks();
  }, []);

  // Fetch data functions
  const fetchCompanies = async () => {
    setLoadingCompanies(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/companies`);
      let companiesData = [];
      if (Array.isArray(response.data)) {
        companiesData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        companiesData = response.data.data;
      } else if (response.data && Array.isArray(response.data.companies)) {
        companiesData = response.data.companies;
      }
      setCompanies(companiesData);
    } catch (error) {
      console.error('Error fetching companies:', error);
      message.error('Failed to load companies');
      setCompanies([]);
    } finally {
      setLoadingCompanies(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/projects`);
      let projectsData = [];
      if (Array.isArray(response.data)) {
        projectsData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        projectsData = response.data.data;
      } else if (response.data && Array.isArray(response.data.projects)) {
        projectsData = response.data.projects;
      }
      setProjects(projectsData);
    } catch (error) {
      console.error('Error fetching projects:', error);
      message.error('Failed to load projects');
    }
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/tasks`);
      let tasksData = [];
      if (Array.isArray(response.data)) {
        tasksData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        tasksData = response.data.data;
      } else if (response.data && Array.isArray(response.data.tasks)) {
        tasksData = response.data.tasks;
      }
      setTasks(tasksData);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      message.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyChange = (companyId) => {
    const company = companies.find(c => c.id === companyId);
    setSelectedCompany(company);
    
    if (form) {
      form.setFieldsValue({
        projectId: undefined
      });
    }
  };

  const handleSubmit = async (values) => {
    if (submitting) return;

    try {
      setSubmitting(true);
      setFormLoading(true);
      
      const formValues = form.getFieldsValue();
      
      const taskData = {
        ...values,
        taskType,
        startDate: values.startDate ? values.startDate.format('YYYY-MM-DD') : null,
        endDate: values.endDate ? values.endDate.format('YYYY-MM-DD') : null,
        status: 'PLANNED',
        companyId: formValues.companyId,
        projectId: formValues.projectId,
        additionalData: values.additionalData || {}
      };

      // Validate required fields
      if (!taskData.companyId) {
        message.error('Company is required');
        return;
      }
      if (!taskData.projectId) {
        message.error('Project is required');
        return;
      }
      if (!taskData.taskName) {
        message.error('Task name is required');
        return;
      }

      let response;
      if (selectedTask) {
        response = await axios.put(`${API_BASE_URL}/tasks/${selectedTask.id}`, taskData);
        message.success('Task updated successfully!');
      } else {
        response = await axios.post(`${API_BASE_URL}/tasks`, taskData);
        message.success('Task created successfully!');
      }

      const savedTask = response.data.data;

      // Update tasks list
      if (selectedTask) {
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === selectedTask.id ? savedTask : task
          )
        );
      } else {
        setTasks(prevTasks => [...prevTasks, savedTask]);
      }

      setSelectedTask(savedTask);
      setViewMode('details');
      form.resetFields();
      setSelectedCompany(null);
      
    } catch (error) {
      console.error('❌ Error saving task:', error);
      const errorMessage = error.response?.data?.message || `Failed to ${selectedTask ? 'update' : 'create'} task`;
      message.error(errorMessage);
    } finally {
      setFormLoading(false);
      setSubmitting(false);
    }
  };

  const handleDeleteTask = async (taskId) => {
    confirm({
      title: 'Are you sure you want to delete this task?',
      icon: <ExclamationCircleOutlined />,
      content: 'This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await axios.delete(`${API_BASE_URL}/tasks/${taskId}`);
          message.success('Task deleted successfully!');
          setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
          if (selectedTask && selectedTask.id === taskId) {
            setSelectedTask(null);
            setViewMode('list');
          }
        } catch (error) {
          console.error('Error deleting task:', error);
          message.error('Failed to delete task');
        }
      },
    });
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setViewMode('create');
    
    form.setFieldsValue({
      companyId: task.companyId,
      projectId: task.projectId,
      taskName: task.taskName,
      taskType: task.taskType,
      startDate: task.startDate ? dayjs(task.startDate) : null,
      endDate: task.endDate ? dayjs(task.endDate) : null,
      notes: task.notes,
      additionalData: task.additionalData || {}
    });
    
    const company = companies.find(c => c.id === task.companyId);
    setSelectedCompany(company);
    setTaskType(task.taskType);
  };

  const handleFormCancel = () => {
    if (selectedTask) {
      setViewMode('details');
    } else {
      setViewMode('list');
    }
    setSelectedCompany(null);
  };

  const handleCreateTask = () => {
    setSelectedTask(null);
    setViewMode('create');
    form.resetFields();
    setTaskType('WORK');
    setSelectedCompany(null);
  };

  // Helper functions for display
  const getStatusColor = (status) => {
    const colorMap = {
      'PLANNED': 'blue',
      'IN_PROGRESS': 'orange',
      'COMPLETED': 'green',
      'CANCELLED': 'red'
    };
    return colorMap[status] || 'gray';
  };

  const getTaskTypeColor = (type) => {
    const colorMap = {
      'WORK': 'blue',
      'TRANSPORT': 'green',
      'MAINTENANCE': 'orange',
      'INSPECTION': 'purple',
      'OTHER': 'gray'
    };
    return colorMap[type] || 'gray';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Simplified table columns - removed Task Date, Task Name, and Status
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      sorter: (a, b) => a.id - b.id,
      responsive: ['md'],
    },
    {
      title: 'Project',
      dataIndex: 'projectName',
      key: 'projectName',
      render: (projectName) => projectName || 'N/A',
      ellipsis: true,
    },
    {
      title: 'Type',
      dataIndex: 'taskType',
      key: 'taskType',
      render: (type) => <Tag color={getTaskTypeColor(type)}>{type}</Tag>,
      responsive: ['sm'],
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 240,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small" style={{ width: '100%', justifyContent: 'center' }}>
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => {
              setSelectedTask(record);
              setViewMode('details');
            }}
            style={{ padding: '4px 8px', minWidth: 'auto' }}
          >
            View
          </Button>
          <Button 
            type="link" 
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEditTask(record)}
            style={{ padding: '4px 8px', minWidth: 'auto' }}
          >
            Edit
          </Button>
          <Button 
            type="link" 
            danger 
            icon={<DeleteOutlined />}
            size="small"
            onClick={() => handleDeleteTask(record.id)}
            style={{ padding: '4px 8px', minWidth: 'auto' }}
          >
            Delete
          </Button>
        </Space>
      ),
    },
  ];

  const DynamicSection = dynamicSections[taskType] || dynamicSections["OTHER"];
  const isEditing = Boolean(selectedTask && viewMode === 'create');

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex-1">
          <Title level={2} className="mb-1 text-xl sm:text-2xl">Task Management</Title>
          <Text type="secondary" className="text-sm sm:text-base">Manage and track all tasks efficiently</Text>
        </div>
        {viewMode === 'list' && (
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleCreateTask}
            size="large"
            className="w-full sm:w-auto"
          >
            Create Task
          </Button>
        )}
      </div>

      {/* Create/Edit Task Form */}
      {viewMode === 'create' && (
        <Card 
          title={
            <div className="flex items-center">
              {isEditing ? <EditOutlined /> : <PlusOutlined />}
              <span className="ml-2 text-base sm:text-lg">
                {isEditing ? `Edit Task - ${selectedTask.taskName}` : 'Create New Task'}
              </span>
            </div>
          } 
          className="mb-6 w-full shadow-lg"
          extra={
            <Button icon={<ArrowLeftOutlined />} onClick={handleFormCancel} className="hidden sm:inline-flex">
              Back
            </Button>
          }
        >
          <Spin spinning={formLoading}>
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              initialValues={{ taskType: 'WORK' }}
            >
              <Row gutter={[16, 16]}>
                <Col xs={24}>
                  <Form.Item
                    name="companyId"
                    label="Company"
                    rules={[{ required: true, message: 'Please select a company' }]}
                  >
                    <Select
                      placeholder="Select Company"
                      onChange={handleCompanyChange}
                      loading={loadingCompanies}
                      showSearch
                      optionFilterProp="children"
                      allowClear
                      size="large"
                    >
                      {companies.map(company => (
                        <Option key={company.id} value={company.id}>
                          {company.name} ({company.tenantCode})
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    name="taskType"
                    label="Task Type"
                    rules={[{ required: true, message: 'Please select task type' }]}
                  >
                    <Select onChange={setTaskType} size="large">
                      <Option value="WORK">Work Task</Option>
                      <Option value="MAINTENANCE">Maintenance</Option>
                      <Option value="INSPECTION">Inspection</Option>
                      <Option value="TRANSPORT">Transport</Option>
                      <Option value="OTHER">Other</Option>
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    name="projectId"
                    label="Project"
                    rules={[{ required: true, message: 'Please select a project' }]}
                  >
                    <Select
                      placeholder="Select Project"
                      loading={loading}
                      showSearch
                      size="large"
                    >
                      {projects.map(project => (
                        <Option key={project.id} value={project.id}>
                          {project.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col xs={24}>
                  <Form.Item
                    name="taskName"
                    label="Task Name"
                    rules={[{ required: true, message: 'Please enter task name' }]}
                  >
                    <Input placeholder="Enter task name" size="large" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    name="startDate"
                    label="Start Date"
                    rules={[{ required: true, message: 'Please select start date' }]}
                  >
                    <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} size="large" />
                  </Form.Item>
                </Col>

                <Col xs={24} sm={12}>
                  <Form.Item
                    name="endDate"
                    label="End Date"
                    rules={[{ required: true, message: 'Please select end date' }]}
                  >
                    <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} size="large" />
                  </Form.Item>
                </Col>

                <Col xs={24}>
                  <Form.Item name="notes" label="Notes">
                    <TextArea 
                      rows={3} 
                      placeholder="Enter any additional notes or instructions" 
                      size="large"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <div className="mt-6 border-t pt-4">
                {taskType === 'TRANSPORT' ? (
                  <DynamicSection form={form} selectedCompany={selectedCompany} />
                ) : (
                  <DynamicSection form={form} />
                )}
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
                <Button onClick={handleFormCancel} className="w-full sm:w-auto order-2 sm:order-1">
                  Cancel
                </Button>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={formLoading}
                  className="w-full sm:w-auto order-1 sm:order-2"
                >
                  {isEditing ? 'Update Task' : 'Create Task'}
                </Button>
              </div>
            </Form>
          </Spin>
        </Card>
      )}

      {/* Task List View */}
      {viewMode === 'list' && (
        <Card className="shadow-sm w-full overflow-hidden">
          <Spin spinning={loading}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
              <div>
                <Text strong className="text-sm sm:text-base">Total Tasks: {tasks.length}</Text>
              </div>
              <Button onClick={fetchTasks} loading={loading} className="w-full sm:w-auto">
                Refresh
              </Button>
            </div>
            <div className="overflow-x-auto">
              <Table 
                columns={columns} 
                dataSource={tasks}
                rowKey="id"
                pagination={{ 
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => 
                    `${range[0]}-${range[1]} of ${total} items`,
                  responsive: true
                }}
                scroll={{ x: 800 }}
                size="middle"
              />
            </div>
          </Spin>
        </Card>
      )}

      {/* Task Details View - Responsive */}
      {viewMode === 'details' && selectedTask && (
        <Card 
          className="w-full shadow-lg"
          title={
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center">
                <EyeOutlined className="text-blue-500 mr-2" />
                <span className="text-base sm:text-lg">Task Details</span>
              </div>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => setViewMode('list')}
                className="w-full sm:w-auto"
              >
                Back to List
              </Button>
            </div>
          }
        >
          {/* Basic Task Information */}
          <div className="mb-6">
            <Title level={4} className="mb-4 text-lg">Basic Information</Title>
            <div className="overflow-x-auto">
              <Descriptions 
                bordered 
                column={{ xs: 1, sm: 1, md: 2 }}
                size="middle"
                labelStyle={{ 
                  fontWeight: '600', 
                  width: '120px',
                  backgroundColor: '#fafafa'
                }}
                contentStyle={{ 
                  backgroundColor: '#fff' 
                }}
              >
                <Descriptions.Item label="Task ID">
                  <Text strong>{selectedTask.id}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Company">
                  {companies.find(c => c.id === selectedTask.companyId)?.name || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Project">
                  {selectedTask.projectName || 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Task Type">
                  <Tag color={getTaskTypeColor(selectedTask.taskType)}>
                    {selectedTask.taskType}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Start Date">
                  {formatDate(selectedTask.startDate)}
                </Descriptions.Item>
                <Descriptions.Item label="End Date">
                  {formatDate(selectedTask.endDate)}
                </Descriptions.Item>
                <Descriptions.Item label="Notes" span={2}>
                  <div className="bg-gray-50 p-3 rounded">
                    {selectedTask.notes || 'No notes provided'}
                  </div>
                </Descriptions.Item>
              </Descriptions>
            </div>
          </div>

          {/* Transport Task Specific Details */}
          {selectedTask.taskType === 'TRANSPORT' && selectedTask.additionalData && (
            <>
              <Divider />
              <div className="mb-6">
                <Title level={4} className="mb-4 text-lg">
                  <CarOutlined className="mr-2" />
                  Transport Details
                </Title>
                <div className="overflow-x-auto">
                  <Descriptions 
                    bordered 
                    column={{ xs: 1, sm: 1, md: 2 }}
                    size="middle"
                    labelStyle={{ 
                      fontWeight: '600', 
                      width: '120px',
                      backgroundColor: '#fafafa'
                    }}
                    contentStyle={{ 
                      backgroundColor: '#fff' 
                    }}
                  >
                    <Descriptions.Item label="Transport Type" span={2}>
                      <Tag color="blue">
                        {selectedTask.additionalData.transportType || 'N/A'}
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="Pickup Location">
                      <EnvironmentOutlined className="mr-1" />
                      {selectedTask.additionalData.pickupLocation || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Drop Location">
                      <EnvironmentOutlined className="mr-1" />
                      {selectedTask.additionalData.dropLocation || 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Pickup Time">
                      <CalendarOutlined className="mr-1" />
                      {formatDateTime(selectedTask.additionalData.pickupTime)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Drop Time">
                      <CalendarOutlined className="mr-1" />
                      {formatDateTime(selectedTask.additionalData.dropTime)}
                    </Descriptions.Item>
                    <Descriptions.Item label="Driver">
                      <UserOutlined className="mr-1" />
                      {selectedTask.additionalData.driverId ? `Driver ID: ${selectedTask.additionalData.driverId}` : 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Vehicle">
                      <CarOutlined className="mr-1" />
                      {selectedTask.additionalData.vehicleId ? `Vehicle ID: ${selectedTask.additionalData.vehicleId}` : 'N/A'}
                    </Descriptions.Item>
                  </Descriptions>
                </div>
              </div>

              {/* Materials for Material Transport */}
              {selectedTask.additionalData.transportType === 'MATERIAL_TRANSPORT' && 
               selectedTask.additionalData.materialQuantities && 
               selectedTask.additionalData.materialQuantities.length > 0 && (
                <div className="mb-6">
                  <Title level={4} className="mb-4 text-lg">
                    <BoxPlotOutlined className="mr-2" />
                    Materials to Transport
                  </Title>
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                    {selectedTask.additionalData.materialQuantities.map((item, index) => (
                      <div key={index} className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 border-b last:border-b-0 gap-2">
                        <div className="flex items-center">
                          <Text strong className="text-base">Material ID: {item.materialId}</Text>
                        </div>
                        <div className="flex items-center">
                          <Text className="mr-2 text-base">Quantity: </Text>
                          <Tag color="green" className="text-base py-1">{item.quantity}</Tag>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tools for Tool Transport */}
              {selectedTask.additionalData.transportType === 'TOOL_TRANSPORT' && 
               selectedTask.additionalData.toolQuantities && 
               selectedTask.additionalData.toolQuantities.length > 0 && (
                <div className="mb-6">
                  <Title level={4} className="mb-4 text-lg">
                    <ToolOutlined className="mr-2" />
                    Tools to Transport
                  </Title>
                  <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                    {selectedTask.additionalData.toolQuantities.map((item, index) => (
                      <div key={index} className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-3 border-b last:border-b-0 gap-2">
                        <div className="flex items-center">
                          <Text strong className="text-base">Tool ID: {item.toolId}</Text>
                        </div>
                        <div className="flex items-center">
                          <Text className="mr-2 text-base">Quantity: </Text>
                          <Tag color="blue" className="text-base py-1">{item.quantity}</Tag>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Action Buttons - Improved Alignment */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 mt-8 pt-6 border-t">
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleCreateTask}
              className="w-full sm:w-auto"
              size="large"
            >
              Create New Task
            </Button>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Button 
                icon={<EditOutlined />}
                onClick={() => handleEditTask(selectedTask)}
                className="w-full sm:w-auto"
                size="large"
              >
                Edit Task
              </Button>
              <Button 
                danger 
                icon={<DeleteOutlined />}
                onClick={() => handleDeleteTask(selectedTask.id)}
                className="w-full sm:w-auto"
                size="large"
              >
                Delete Task
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default TaskPage;