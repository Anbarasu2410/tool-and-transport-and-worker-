import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Select, 
  Input, 
  TimePicker, 
  InputNumber, 
  Card, 
  Space, 
  Button, 
  Tag,
  Divider,
  Spin,
  Alert,
  Row,
  Col,
  Typography,
  message
} from 'antd';
import { 
  PlusOutlined, 
  MinusCircleOutlined,
  CarOutlined,
  ToolOutlined,
  TeamOutlined,
  CheckCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

const API_BASE_URL = 'http://localhost:5000/api';

const TransportTaskForm = ({ form, selectedCompany }) => {
  const [transportType, setTransportType] = useState('');
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [tools, setTools] = useState([]);
  const [loadingDrivers, setLoadingDrivers] = useState(false);
  const [loadingVehicles, setLoadingVehicles] = useState(false);
  const [loadingWorkers, setLoadingWorkers] = useState(false);
  const [loadingMaterials, setLoadingMaterials] = useState(false);
  const [loadingTools, setLoadingTools] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Fetch data when company changes
  useEffect(() => {
    if (selectedCompany?.id) {
      fetchDrivers(selectedCompany.id);
      fetchVehicles(selectedCompany.id);
    } else {
      setDrivers([]);
      setVehicles([]);
      setWorkers([]);
      setMaterials([]);
      setTools([]);
      setSelectedVehicle(null);
    }
  }, [selectedCompany]);

  // Fetch workers, materials, tools when transport type changes
  useEffect(() => {
    if (selectedCompany?.id && transportType) {
      switch (transportType) {
        case 'WORKER_TRANSPORT':
          fetchWorkers(selectedCompany.id);
          break;
        case 'MATERIAL_TRANSPORT':
          fetchMaterials();
          break;
        case 'TOOL_TRANSPORT':
          fetchTools();
          break;
        default:
          break;
      }
    }
  }, [transportType, selectedCompany]);

  const fetchDrivers = async (companyId) => {
    setLoadingDrivers(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/employees/company/${companyId}`);
      let driversData = [];
      if (Array.isArray(response.data)) {
        driversData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        driversData = response.data.data;
      }
      setDrivers(driversData);
    } catch (error) {
      console.error('Error fetching drivers:', error);
      setDrivers([]);
    } finally {
      setLoadingDrivers(false);
    }
  };

  const fetchVehicles = async (companyId) => {
    setLoadingVehicles(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/fleet-vehicles/company/${companyId}`);
      let vehiclesData = [];
      if (Array.isArray(response.data)) {
        vehiclesData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        vehiclesData = response.data.data;
      } else if (response.data && response.data.vehicles) {
        vehiclesData = response.data.vehicles;
      }
      setVehicles(vehiclesData);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      setVehicles([]);
    } finally {
      setLoadingVehicles(false);
    }
  };

  const fetchWorkers = async (companyId) => {
    setLoadingWorkers(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/employees/workers`, {
        params: { companyId, search: '', role: 'worker' }
      });
      
      let workersData = [];
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        workersData = response.data.data;
      } else if (Array.isArray(response.data)) {
        workersData = response.data;
      }
      
      setWorkers(workersData);
    } catch (error) {
      console.error('Error fetching workers:', error);
      setWorkers([]);
    } finally {
      setLoadingWorkers(false);
    }
  };

  const fetchMaterials = async () => {
    setLoadingMaterials(true);
    try {
      console.log('Fetching materials from Materials collection');
      const response = await axios.get(`${API_BASE_URL}/materials`);
      console.log('Materials API response:', response.data);
      
      let materialsData = [];
      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        materialsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        materialsData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        materialsData = response.data.data;
      }
      
      console.log('Processed materials data:', materialsData);
      setMaterials(materialsData);
      
      if (materialsData.length === 0) {
        message.warning('No materials found in database');
      } else {
        message.success(`Loaded ${materialsData.length} materials from database`);
      }
    } catch (error) {
      console.error('Error fetching materials:', error);
      message.error('Failed to load materials from database');
      setMaterials([]);
    } finally {
      setLoadingMaterials(false);
    }
  };

  const fetchTools = async () => {
    setLoadingTools(true);
    try {
      console.log('Fetching tools from Tools collection');
      const response = await axios.get(`${API_BASE_URL}/tools`);
      console.log('Tools API response:', response.data);
      
      let toolsData = [];
      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        toolsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        toolsData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        toolsData = response.data.data;
      }
      
      console.log('Processed tools data:', toolsData);
      setTools(toolsData);
      
      if (toolsData.length === 0) {
        message.warning('No tools found in database');
      } else {
        message.success(`Loaded ${toolsData.length} tools from database`);
      }
    } catch (error) {
      console.error('Error fetching tools:', error);
      message.error('Failed to load tools from database');
      setTools([]);
    } finally {
      setLoadingTools(false);
    }
  };

  const handleVehicleChange = (vehicleId) => {
    const vehicle = vehicles.find(v => v.id === vehicleId || v._id === vehicleId);
    setSelectedVehicle(vehicle);
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      'AVAILABLE': { color: 'green', icon: <CheckCircleOutlined /> },
      'IN_SERVICE': { color: 'blue', icon: <CarOutlined /> },
      'MAINTENANCE': { color: 'orange', icon: <WarningOutlined /> },
      'OUT_OF_SERVICE': { color: 'red', icon: <WarningOutlined /> }
    };
    
    const config = statusConfig[status] || { color: 'default', icon: null };
    return (
      <Tag color={config.color} icon={config.icon}>
        {status?.replace('_', ' ') || 'UNKNOWN'}
      </Tag>
    );
  };

  const renderVehicleInfo = () => {
    if (!selectedVehicle) return null;

    return (
      <Card size="small" title="Selected Vehicle Details" className="mt-3">
        <Row gutter={[16, 8]}>
          <Col span={12}><Text strong>Registration No:</Text><br /><Text>{selectedVehicle.registrationNo || 'N/A'}</Text></Col>
          <Col span={12}><Text strong>Vehicle Type:</Text><br /><Text>{selectedVehicle.vehicleType || 'N/A'}</Text></Col>
          <Col span={12}><Text strong>Status:</Text><br />{getStatusTag(selectedVehicle.status)}</Col>
        </Row>
      </Card>
    );
  };

  const renderPassengersItemsSection = () => {
    if (!selectedCompany) {
      return (
        <Alert 
          message="Please select a company first to load passengers/items" 
          type="info" 
          showIcon 
        />
      );
    }

    switch (transportType) {
      case 'WORKER_TRANSPORT':
        return (
          <Spin spinning={loadingWorkers}>
            <Form.Item 
              name={['additionalData', 'workers']} 
              label="Select Workers"
              rules={transportType === 'WORKER_TRANSPORT' ? [{ required: true, message: 'Please select workers' }] : []}
            >
              <Select 
                mode="multiple" 
                placeholder="Select workers to transport"
                showSearch
                optionFilterProp="children"
                loading={loadingWorkers}
                disabled={!selectedCompany}
                filterOption={(input, option) =>
                  option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                }
              >
                {workers.map(worker => (
                  <Option key={worker.id} value={worker.id}>
                    {worker.fullName} - {worker.employeeCode} ({worker.jobTitle})
                  </Option>
                ))}
              </Select>
            </Form.Item>
            
            {workers.length === 0 && !loadingWorkers && (
              <Alert 
                message="No workers found" 
                description="No active workers found for the selected company."
                type="info" 
                showIcon 
                className="mt-2"
              />
            )}
          </Spin>
        );

      case 'MATERIAL_TRANSPORT':
        return (
          <Spin spinning={loadingMaterials}>
            <Form.List name={['additionalData', 'materialQuantities']}>
              {(fields, { add, remove }) => (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium">Materials to Transport</span>
                    <Button 
                      type="dashed" 
                      onClick={() => add()} 
                      icon={<PlusOutlined />}
                      disabled={!selectedCompany}
                    >
                      Add Material
                    </Button>
                  </div>
                  
                  {fields.map((field, index) => (
                    <Space key={field.key} className="flex w-full mb-2" align="baseline">
                      <Form.Item
                        {...field}
                        name={[field.name, 'materialId']}
                        rules={[{ required: true, message: 'Select material' }]}
                        className="flex-1"
                      >
                        <Select 
                          placeholder="Select material from Materials collection" 
                          showSearch
                          optionFilterProp="children"
                          loading={loadingMaterials}
                          filterOption={(input, option) =>
                            option.children.toLowerCase().includes(input.toLowerCase())
                          }
                        >
                          {materials.map(material => (
                            <Option key={material.id || material.id} value={material.id }>
                              {material.name} ({material.unit || 'N/A'})
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <Form.Item
                        {...field}
                        name={[field.name, 'quantity']}
                        rules={[{ required: true, message: 'Enter quantity' }]}
                        className="w-32"
                      >
                        <InputNumber placeholder="Qty" min={1} style={{ width: '100%' }} />
                      </Form.Item>
                      <MinusCircleOutlined 
                        onClick={() => remove(field.name)} 
                        className="text-red-500 cursor-pointer"
                      />
                    </Space>
                  ))}
                  
                  {fields.length === 0 && (
                    <div className="text-gray-500 text-center py-4">
                      No materials added. Click "Add Material" to start.
                    </div>
                  )}
                  
                  {materials.length === 0 && !loadingMaterials && (
                    <Alert 
                      message="No materials found in database" 
                      description="No materials available in Materials collection."
                      type="warning" 
                      showIcon 
                      className="mt-2"
                    />
                  )}
                </div>
              )}
            </Form.List>
          </Spin>
        );

      case 'TOOL_TRANSPORT':
        return (
          <Spin spinning={loadingTools}>
            <Form.List name={['additionalData', 'toolQuantities']}>
              {(fields, { add, remove }) => (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium">Tools to Transport</span>
                    <Button 
                      type="dashed" 
                      onClick={() => add()} 
                      icon={<PlusOutlined />}
                      disabled={!selectedCompany}
                    >
                      Add Tool
                    </Button>
                  </div>
                  
                  {fields.map((field, index) => (
                    <Space key={field.key} className="flex w-full mb-2" align="baseline">
                      <Form.Item
                        {...field}
                        name={[field.name, 'toolId']}
                        rules={[{ required: true, message: 'Select tool' }]}
                        className="flex-1"
                      >
                        <Select 
                          placeholder="Select tool from Tools collection" 
                          showSearch
                          optionFilterProp="children"
                          loading={loadingTools}
                          filterOption={(input, option) =>
                            option.children.toLowerCase().includes(input.toLowerCase())
                          }
                        >
                          {tools.map(tool => (
                            <Option key={tool.id || tool.id} value={tool.id }>
                              {tool.name} ({tool.quantityAvailable || 0})
                            </Option>
                          ))}
                        </Select>
                      </Form.Item>
                      <Form.Item
                        {...field}
                        name={[field.name, 'quantity']}
                        rules={[{ required: true, message: 'Enter quantity' }]}
                        className="w-32"
                      >
                        <InputNumber 
                          placeholder="Qty" 
                          min={1} 
                          style={{ width: '100%' }} 
                        />
                      </Form.Item>
                      <MinusCircleOutlined 
                        onClick={() => remove(field.name)} 
                        className="text-red-500 cursor-pointer"
                      />
                    </Space>
                  ))}
                  
                  {fields.length === 0 && (
                    <div className="text-gray-500 text-center py-4">
                      No tools added. Click "Add Tool" to start.
                    </div>
                  )}
                  
                  {tools.length === 0 && !loadingTools && (
                    <Alert 
                      message="No tools found in database" 
                      description="No tools available in Tools collection."
                      type="warning" 
                      showIcon 
                      className="mt-2"
                    />
                  )}
                </div>
              )}
            </Form.List>
          </Spin>
        );

      default:
        return (
          <div className="text-gray-500 text-center py-4">
            Select a transport type to configure passengers/items
          </div>
        );
    }
  };

  return (
    <Card title="🚐 Transport Task Details" size="small" className="mb-4">
      {!selectedCompany && (
        <Alert 
          message="Company selection required" 
          description="Please select a company first to load drivers and vehicles."
          type="warning" 
          showIcon 
          className="mb-4"
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Driver Selection */}
        <Form.Item 
          name={['additionalData', 'driverId']} 
          label="Driver"
          rules={[{ required: true, message: 'Please select a driver' }]}
        >
          <Select 
            placeholder={selectedCompany ? "Select driver" : "Select company first"}
            showSearch
            optionFilterProp="children"
            loading={loadingDrivers}
            disabled={!selectedCompany}
          >
            {drivers.map(driver => (
              <Option key={driver.id} value={driver.id}>
                {driver.fullName} - {driver.employeeCode} ({driver.jobTitle})
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Vehicle Selection */}
        <Form.Item 
          name={['additionalData', 'vehicleId']} 
          label="Vehicle"
          rules={[{ required: true, message: 'Please select a vehicle' }]}
        >
          <Select 
            placeholder={selectedCompany ? "Select vehicle" : "Select company first"}
            showSearch
            optionFilterProp="children"
            loading={loadingVehicles}
            disabled={!selectedCompany}
            onChange={handleVehicleChange}
          >
            {vehicles.map(vehicle => (
              <Option key={vehicle.id} value={vehicle.id}>
                <Space>
                  <CarOutlined />
                  <span>{vehicle.registrationNo}</span>
                  <span>-</span>
                  <span>{vehicle.vehicleType}</span>
                  {getStatusTag(vehicle.status)}
                </Space>
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Transport Type */}
        <Form.Item 
          name={['additionalData', 'transportType']} 
          label="Transport Type"
          rules={[{ required: true, message: 'Please select transport type' }]}
        >
          <Select 
            placeholder="Select transport type" 
            onChange={setTransportType}
            disabled={!selectedCompany}
          >
            <Option value="WORKER_TRANSPORT">
              <Space>
                <TeamOutlined />
                <span>WORKER TRANSPORT</span>
              </Space>
            </Option>
            <Option value="MATERIAL_TRANSPORT">
              <Space>
                <ToolOutlined />
                <span>MATERIAL TRANSPORT</span>
              </Space>
            </Option>
            <Option value="TOOL_TRANSPORT">
              <Space>
                <ToolOutlined />
                <span>TOOL TRANSPORT</span>
              </Space>
            </Option>
          </Select>
        </Form.Item>

        {/* Pickup Location */}
        <Form.Item 
          name={['additionalData', 'pickupLocation']} 
          label="Pickup Location"
          rules={[{ required: true, message: 'Please enter pickup location' }]}
        >
          <Input placeholder="Enter pickup location" />
        </Form.Item>

        {/* Drop Location */}
        <Form.Item 
          name={['additionalData', 'dropLocation']} 
          label="Drop Location"
          rules={[{ required: true, message: 'Please enter drop location' }]}
        >
          <Input placeholder="Enter drop location" />
        </Form.Item>

        {/* Pickup Time */}
        <Form.Item 
          name={['additionalData', 'pickupTime']} 
          label="Pickup Time"
          rules={[{ required: true, message: 'Please select pickup time' }]}
        >
          <TimePicker 
            format="HH:mm" 
            placeholder="Select pickup time" 
            style={{ width: '100%' }}
            minuteStep={5}
          />
        </Form.Item>

        {/* Drop Time */}
        <Form.Item 
          name={['additionalData', 'dropTime']} 
          label="Drop Time"
          rules={[{ required: true, message: 'Please select drop time' }]}
        >
          <TimePicker 
            format="HH:mm" 
            placeholder="Select drop time" 
            style={{ width: '100%' }}
            minuteStep={5}
          />
        </Form.Item>
      </div>

      {/* Selected Vehicle Details */}
      {selectedVehicle && renderVehicleInfo()}

      {/* Passengers / Items Section */}
      <Divider>Passengers / Items</Divider>
      {renderPassengersItemsSection()}

      {/* Remarks */}
      <Form.Item 
        name={['additionalData', 'remarks']} 
        label="Remarks"
        className="mt-4"
      >
        <TextArea 
          rows={3} 
          placeholder="Enter any additional remarks or instructions" 
        />
      </Form.Item>
    </Card>
  );
};

export default TransportTaskForm;