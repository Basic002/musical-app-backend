import mongoose from 'mongoose';
import CoreMapper from './core.mapper.js';
import eventSchema from '../schemas/event.schema.js';

class EventMapper extends CoreMapper {
    constructor() {
        super(mongoose);
        this.model = this.mongoose.model('Event', eventSchema);
    }

    async findAll() {
        return await this.model.find();
    }

    async findById(id) {
        return await this.model.findById(id);
    }

    async create(data) {
        return await this.model.create(data);
    }

    async update(id, data) {
        return await this.model.findByIdAndUpdate(id, data, { new: true });
    }

    async delete(id) {
        return await this.model.findByIdAndDelete(id);
    }
}

export default new EventMapper();