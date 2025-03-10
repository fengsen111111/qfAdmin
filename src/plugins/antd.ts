import {
    Button,
    Cascader,
    Checkbox,
    Col,
    ConfigProvider,
    DatePicker,
    Drawer,
    Dropdown,
    Form,
    Image,
    Input,
    InputNumber,
    Layout,
    Menu,
    Modal,
    Pagination,
    Radio,
    Rate,
    Row,
    Select,
    Spin,
    Switch,
    Table,
    Tag,
    TimePicker,
    Tree,
    TreeSelect,
    Upload,
    Tabs,
    Popover
} from 'ant-design-vue'


const plugins = [
    Layout, Menu, Tag, Dropdown, ConfigProvider, TimePicker, DatePicker, Drawer,
    Input, InputNumber, Radio, Checkbox, Row, Col, Switch, Select, Tree, Cascader,
    Upload, Button, Form, Table, Pagination, Image, Rate, Spin, TreeSelect, Modal,
    Tabs,Popover
];

export const setupAntd = (app: any, options = {}) => {
    plugins.forEach((plugin) => {
        app.use(plugin);
    });
};
