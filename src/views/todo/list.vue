<template>
    <div class="app-container">
        <div class="btn-container">
            <el-button
                type="primary"
                icon="el-icon-plus"
                circle
            />

            <el-button
                type="danger"
                icon="el-icon-delete"
                circle
            />

            <el-button
                type="primary"
                icon="el-icon-edit"
                circle
            />

            <el-button
                type="primary"
                icon="el-icon-download"
                circle
            />
        </div>

        <div class="filter-container">
            <el-input
                v-model="searchInput"
                placeholder="请输入内容"
            />

            <el-select
                v-model="searchLevel"
                placeholder="请选择重要程度"
                clearable
            >
                <el-option
                    v-for="item in levelOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                />
            </el-select>

            <el-date-picker
                v-model="searchDate"
                type="daterange"
                align="right"
                unlink-panels
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :picker-options="dateOptions"
            />

            <el-select
                v-model="searchState"
                placeholder="请选择状态"
                clearable
            >
                <el-option
                    v-for="item in stateOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                />
            </el-select>

            <el-button
                type="primary"
                icon="el-icon-search"
            >
                搜索
            </el-button>
        </div>

        <el-table
            :key="tableKey"
            v-loading="listLoading"
            :data="list"
            border
            fit
            highlight-current-row
            style="width: 100%;"
            @sort-change="sortChange"
        >
            <el-table-column
                label="ID"
                prop="id"
                sortable="custom"
                align="center"
                width="80"
                :class-name="getSortClass('id')"
            >
                <template slot-scope="scope">
                    <span>{{ scope.row.id }}</span>
                </template>
            </el-table-column>
            <el-table-column
                label="Date"
                width="150px"
                align="center"
            >
                <template slot-scope="scope">
                    <span>{{ scope.row.timestamp | parseTime('{y}-{m}-{d} {h}:{i}') }}</span>
                </template>
            </el-table-column>
            <el-table-column
                label="Title"
                min-width="150px"
            >
                <template slot-scope="{row}">
                    <span
                        class="link-type"
                        @click="handleUpdate(row)"
                    >{{ row.title }}</span>
                    <el-tag>{{ row.type | typeFilter }}</el-tag>
                </template>
            </el-table-column>
            <el-table-column
                label="Author"
                width="110px"
                align="center"
            >
                <template slot-scope="scope">
                    <span>{{ scope.row.author }}</span>
                </template>
            </el-table-column>
            <el-table-column
                v-if="showReviewer"
                label="Reviewer"
                width="110px"
                align="center"
            >
                <template slot-scope="scope">
                    <span style="color:red;">{{ scope.row.reviewer }}</span>
                </template>
            </el-table-column>
            <el-table-column
                label="Imp"
                width="80px"
            >
                <template slot-scope="scope">
                    <svg-icon
                        v-for="n in +scope.row.importance"
                        :key="n"
                        icon-class="star"
                        class="meta-item__icon"
                    />
                </template>
            </el-table-column>
            <el-table-column
                label="Readings"
                align="center"
                width="95"
            >
                <template slot-scope="{row}">
                    <span
                        v-if="row.pageviews"
                        class="link-type"
                        @click="handleFetchPv(row.pageviews)"
                    >{{ row.pageviews }}</span>
                    <span v-else>0</span>
                </template>
            </el-table-column>
            <el-table-column
                label="Status"
                class-name="status-col"
                width="100"
            >
                <template slot-scope="{row}">
                    <el-tag :type="row.status | statusFilter">
                        {{ row.status }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column
                label="Actions"
                align="center"
                width="230"
                class-name="small-padding fixed-width"
            >
                <template slot-scope="{row}">
                    <el-button
                        type="primary"
                        size="mini"
                        @click="handleUpdate(row)"
                    >
                        Edit
                    </el-button>
                    <el-button
                        v-if="row.status!='published'"
                        size="mini"
                        type="success"
                        @click="handleModifyStatus(row,'published')"
                    >
                        Publish
                    </el-button>
                    <el-button
                        v-if="row.status!='draft'"
                        size="mini"
                        @click="handleModifyStatus(row,'draft')"
                    >
                        Draft
                    </el-button>
                    <el-button
                        v-if="row.status!='deleted'"
                        size="mini"
                        type="danger"
                        @click="handleModifyStatus(row,'deleted')"
                    >
                        Delete
                    </el-button>
                </template>
            </el-table-column>
        </el-table>

        <pagination
            v-show="total>0"
            :total="total"
            :page.sync="listQuery.page"
            :limit.sync="listQuery.limit"
            @pagination="getList"
        />
    </div>
</template>

<script>
import Pagination from '@/components/Pagination'; // secondary package based on el-pagination

export default {
    name: 'TodoList',
    components: {
        Pagination
    },
    data() {
        return {
            /** input输入内容 */
            searchInput: '',
            /** 搜索程度 */
            searchLevel: '',
            /** 搜索时间段 */
            searchDate: [],
            /** 搜索状态 */
            searchState: '',

            levelOptions: [{
                value: '0',
                label: '紧急 & 重要'
            }, {
                value: '1',
                label: '紧急 & 不重要'
            }, {
                value: '2',
                label: '不紧急 & 重要'
            }, {
                value: '3',
                label: '不紧急 & 不重要'
            }],
            dateOptions: {
                shortcuts: [{
                    text: '最近一周',
                    onClick(picker) {
                    const end = new Date();
                    const start = new Date();
                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
                    picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: '最近一个月',
                    onClick(picker) {
                    const end = new Date();
                    const start = new Date();
                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
                    picker.$emit('pick', [start, end]);
                    }
                }, {
                    text: '最近三个月',
                    onClick(picker) {
                    const end = new Date();
                    const start = new Date();
                    start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
                    picker.$emit('pick', [start, end]);
                    }
                }]
            },
            stateOptions: [{
                value: 0,
                label: '待办'
            }, {
                value: 1,
                label: '处理中'
            }, {
                value: 2,
                label: '完成'
            }, {
                value: 3,
                label: '放弃'
            }]
        };
    }
};
</script>

<style lang="stylus" scoped>
    .btn-container
        margin-bottom 20px
    .filter-container
        >>> .el-input
            width auto
        >>> .el-range-separator
            width auto
</style>
