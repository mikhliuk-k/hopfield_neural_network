class Block
  def initialize(options = {})
    @client = options[:client] ? options[:client] : Mongo::Client.new(["127.0.0.1:27017"], database: "block")
  end

  def add(data)
    block = {
        data: data
    }

    @client[:blocks].insert_one(block).inserted_ids.first
  end

  def find_all
    @client[:blocks].find({}).map do |doc|
      doc
    end
  end

  def find_by_id(id)
    @client[:blocks].find(_id: BSON::ObjectId(id)).first
  end

end
